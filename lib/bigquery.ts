import { BigQuery } from '@google-cloud/bigquery'
import { logger } from './logger'

interface AnalysisRecord {
  client_name: string
  analysis: string
  created_at: string
  brand_name?: string
  category?: string
  website?: string
}

interface SaveAnalysisParams {
  clientName: string
  analysis: string
  brandName?: string
  category?: string
  website?: string
}

interface SearchFilters {
  brandName?: string
  category?: string
  clientName?: string
  startDate?: string
  endDate?: string
}

interface ShareRecord {
  share_id: string
  analysis_id: string
  shared_by: string
  shared_with: string
  brand_name: string
  created_at: string
  expires_at: string
  is_active: boolean
  view_count: number
  last_viewed: string | null
}

interface CreateShareParams {
  analysisId: string
  sharedBy: string
  sharedWith: string
  brandName: string
  expiresInDays?: number
}

// NEW: User Role and Permission Interfaces
interface UserRole {
  user_email: string
  role: 'admin' | 'regular'
  created_at: string
  created_by: string
  is_active: boolean
}

interface AnalysisPermission {
  permission_id: string
  analysis_id: string
  user_email: string
  granted_by: string
  granted_at: string
  is_active: boolean
  brand_name: string
  category: string
}

interface CreatePermissionParams {
  analysisId: string
  userEmail: string
  grantedBy: string
  brandName: string
  category: string
}

interface SetUserRoleParams {
  userEmail: string
  role: 'admin' | 'regular'
  createdBy: string
}

class BigQueryService {
  private bigquery: BigQuery
  private datasetId: string
  private tableId: string
  private projectId: string

  constructor() {
    try {
      // Get configuration from environment variables
      this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'discovery-flow'
      this.datasetId = process.env.BIGQUERY_DATASET_ID || 'content_df'
      this.tableId = process.env.BIGQUERY_TABLE_ID || 'perception'

      // Initialize BigQuery client
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        // Production/Vercel: Use JSON credentials from environment variable
        logger.info('🔧 Initializing BigQuery with JSON credentials from environment')
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
        
        this.bigquery = new BigQuery({
          projectId: this.projectId,
          credentials: credentials,
        })
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Local development: Use service account file path
        logger.info('🔧 Initializing BigQuery with service account file')
        this.bigquery = new BigQuery({
          projectId: this.projectId,
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        })
      } else {
        // Fallback: Use default application credentials (if available)
        logger.info('🔧 Initializing BigQuery with default application credentials')
        this.bigquery = new BigQuery({
          projectId: this.projectId,
        })
      }

      logger.info(`✅ BigQuery initialized - Project: ${this.projectId}, Dataset: ${this.datasetId}, Table: ${this.tableId}`)
    } catch (error) {
      logger.error('❌ BigQuery initialization failed:', error)
      throw error
    }
  }

  // Public method to access the BigQuery client for campaigns API
  getBigQueryClient(): BigQuery {
    return this.bigquery
  }

  // Method to create campaigns table if it doesn't exist
  async createCampaignsTableIfNotExists(): Promise<void> {
    try {
      const dataset = this.bigquery.dataset('content_df')
      const table = dataset.table('campaigns')
      
      // Check if table exists
      const [exists] = await table.exists()
      
      if (!exists) {
        logger.info('📋 Creating campaigns table...')
        
        const schema = [
          { name: 'campaign_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'brand_name', type: 'STRING', mode: 'REQUIRED' },
          { name: 'campaign_name', type: 'STRING', mode: 'REQUIRED' },
          { name: 'campaign_data', type: 'JSON', mode: 'REQUIRED' },
          { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
          { name: 'mode', type: 'STRING', mode: 'REQUIRED' },
          { name: 'status', type: 'STRING', mode: 'REQUIRED' },
          { name: 'created_by', type: 'STRING', mode: 'NULLABLE' },
          { name: 'updated_at', type: 'TIMESTAMP', mode: 'NULLABLE' },
          { name: 'description', type: 'STRING', mode: 'NULLABLE' },
        ]

        const options = {
          schema: schema,
          timePartitioning: {
            type: 'DAY',
            field: 'created_at',
          },
          clustering: {
            fields: ['brand_name', 'status'],
          },
        }

        await table.create(options)
        logger.info('✅ Campaigns table created successfully')
      } else {
        logger.info('✅ Campaigns table already exists')
      }
    } catch (error) {
      logger.error('❌ Failed to create campaigns table:', error)
      throw new Error(`Failed to create campaigns table: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Helper method to handle BigQuery errors with better messaging
  private handleBigQueryError(error: any, operation: string): never {
    logger.error(`❌ BigQuery ${operation} failed:`, error)
    
    if (error.message && error.message.includes('invalid_grant')) {
      throw new Error('BigQuery authentication failed: Service account credentials have expired or been revoked. Please regenerate your service account key.')
    } else if (error.code === 401 || error.code === 403) {
      throw new Error('BigQuery authentication failed: Insufficient permissions or invalid credentials.')
    } else if (error.name === 'PartialFailureError' || (error.errors && error.errors.length > 0)) {
      // Handle BigQuery insert errors (usually table not found)
      const firstError = error.errors?.[0]?.errors?.[0]
      if (firstError && (firstError.reason === 'notFound' || firstError.message?.includes('not found'))) {
        throw new Error('BigQuery table not found. Please create the campaigns table first.')
      } else {
        throw new Error(`BigQuery insert failed: ${firstError?.message || 'Unknown error'}`)
      }
    } else if (error.message && error.message.includes('not found')) {
      throw new Error('BigQuery table or dataset not found. Please ensure the table exists.')
    } else {
      throw error
    }
  }

  async saveAnalysis(params: SaveAnalysisParams): Promise<string> {
    try {
      logger.info(`💾 Saving analysis result for ${params.brandName} to BigQuery...`)

      const record: AnalysisRecord = {
        client_name: params.clientName,
        analysis: params.analysis,
        created_at: new Date().toISOString(),
        brand_name: params.brandName || undefined,
        category: params.category || undefined,
        website: params.website || undefined,
      }

      const [job] = await this.bigquery
        .dataset(this.datasetId)
        .table(this.tableId)
        .insert([record])

      logger.info(`✅ Analysis saved to BigQuery successfully`)
      
      // Return a unique ID based on timestamp and brand name for reference
      const analysisId = `${params.brandName}_${Date.now()}`
      return analysisId

    } catch (error) {
      this.handleBigQueryError(error, 'save analysis')
    }
  }

  async getAnalyses(filters: SearchFilters = {}, limit: number = 50): Promise<AnalysisRecord[]> {
    try {
      logger.info(`🔍 Fetching analysis history from BigQuery...`)

      let whereClause = 'WHERE 1=1'
      const params: any = {}

      if (filters.brandName) {
        whereClause += ' AND LOWER(brand_name) LIKE LOWER(@brandName)'
        params.brandName = `%${filters.brandName}%`
      }

      if (filters.category) {
        whereClause += ' AND LOWER(category) LIKE LOWER(@category)'
        params.category = `%${filters.category}%`
      }

      if (filters.clientName) {
        whereClause += ' AND LOWER(client_name) LIKE LOWER(@clientName)'
        params.clientName = `%${filters.clientName}%`
      }

      if (filters.startDate) {
        whereClause += ' AND created_at >= @startDate'
        params.startDate = filters.startDate
      }

      if (filters.endDate) {
        whereClause += ' AND created_at <= @endDate'
        params.endDate = filters.endDate
      }

      const query = `
        SELECT 
          client_name,
          analysis,
          created_at,
          brand_name,
          category,
          website
        FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `

      const [rows] = await this.bigquery.query({
        query,
        params,
      })

      logger.info(`📊 Retrieved ${rows.length} analysis records from BigQuery`)
      return rows as AnalysisRecord[]

    } catch (error) {
      this.handleBigQueryError(error, 'fetch analysis history')
    }
  }

  async getAnalysisByBrand(brandName: string): Promise<AnalysisRecord | null> {
    try {
      logger.info(`🔍 Fetching latest analysis for ${brandName} from BigQuery...`)

      const query = `
        SELECT 
          client_name,
          analysis,
          created_at,
          brand_name,
          category,
          website
        FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
        WHERE LOWER(brand_name) = LOWER(@brandName)
        ORDER BY created_at DESC
        LIMIT 1
      `

      const [rows] = await this.bigquery.query({
        query,
        params: { brandName },
      })

      if (rows.length > 0) {
        logger.info(`✅ Found existing analysis for ${brandName}`)
        return rows[0] as AnalysisRecord
      } else {
        logger.info(`❌ No existing analysis found for ${brandName}`)
        return null
      }

    } catch (error) {
      logger.error(`❌ Failed to fetch analysis for ${brandName}:`, error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const query = `SELECT 1 as test`
      await this.bigquery.query(query)
      logger.info('✅ BigQuery connection test successful')
      return true
    } catch (error) {
      logger.error('❌ BigQuery connection test failed:', error)
      return false
    }
  }

  // Sharing functionality methods
  async createShare(params: CreateShareParams): Promise<string> {
    try {
      logger.info(`🔗 Creating share for analysis ${params.analysisId}...`)

      // Generate unique share ID
      const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Calculate expiration date (default 30 days)
      const expiresInDays = params.expiresInDays || 30
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)

      const shareRecord: ShareRecord = {
        share_id: shareId,
        analysis_id: params.analysisId,
        shared_by: params.sharedBy,
        shared_with: params.sharedWith,
        brand_name: params.brandName,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
        view_count: 0,
        last_viewed: null
      }

      // Create shares table if it doesn't exist
      const sharesTableId = `${this.tableId}_shares`
      
      try {
        await this.bigquery
          .dataset(this.datasetId)
          .table(sharesTableId)
          .insert([shareRecord])
      } catch (error: any) {
        if (error.code === 404) {
          // Table doesn't exist, create it
          await this.createSharesTable()
          // Retry the insert
          await this.bigquery
            .dataset(this.datasetId)
            .table(sharesTableId)
            .insert([shareRecord])
        } else {
          throw error
        }
      }

      logger.info(`✅ Share created successfully: ${shareId}`)
      return shareId

    } catch (error) {
      logger.error('❌ Failed to create share:', error)
      throw error
    }
  }

  async getSharedAnalysis(shareId: string, userEmail: string): Promise<{ analysis: AnalysisRecord; shareInfo: ShareRecord } | null> {
    try {
      logger.info(`🔍 Fetching shared analysis for share ID: ${shareId}`)

      const sharesTableId = `${this.tableId}_shares`
      
      // Get share record and verify access
      const shareQuery = `
        SELECT *
        FROM \`${this.projectId}.${this.datasetId}.${sharesTableId}\`
        WHERE share_id = @shareId 
          AND shared_with = @userEmail
          AND is_active = true
          AND expires_at > CURRENT_TIMESTAMP()
        LIMIT 1
      `

      const [shareRows] = await this.bigquery.query({
        query: shareQuery,
        params: { shareId, userEmail }
      })

      if (shareRows.length === 0) {
        logger.info(`❌ No valid share found for ${shareId} and user ${userEmail}`)
        return null
      }

      const shareRecord = shareRows[0] as ShareRecord

      // Get the actual analysis data
      const analysisQuery = `
        SELECT *
        FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
        WHERE brand_name = @brandName
        ORDER BY created_at DESC
        LIMIT 1
      `

      const [analysisRows] = await this.bigquery.query({
        query: analysisQuery,
        params: { brandName: shareRecord.brand_name }
      })

      if (analysisRows.length === 0) {
        logger.info(`❌ No analysis found for brand: ${shareRecord.brand_name}`)
        return null
      }

      const analysis = analysisRows[0] as AnalysisRecord

      // Update view count
      await this.updateShareViewCount(shareId)

      logger.info(`✅ Retrieved shared analysis for ${shareRecord.brand_name}`)
      return {
        analysis,
        shareInfo: shareRecord
      }

    } catch (error) {
      logger.error(`❌ Failed to fetch shared analysis:`, error)
      throw error
    }
  }

  async getSharesByUser(userEmail: string): Promise<ShareRecord[]> {
    try {
      logger.info(`🔍 Fetching shares created by user: ${userEmail}`)

      const sharesTableId = `${this.tableId}_shares`
      
      const query = `
        SELECT *
        FROM \`${this.projectId}.${this.datasetId}.${sharesTableId}\`
        WHERE shared_by = @userEmail
        ORDER BY created_at DESC
      `

      const [rows] = await this.bigquery.query({
        query,
        params: { userEmail }
      })

      logger.info(`📊 Found ${rows.length} shares for user ${userEmail}`)
      return rows as ShareRecord[]

    } catch (error) {
      logger.error('❌ Failed to fetch user shares:', error)
      throw error
    }
  }

  async revokeShare(shareId: string, userEmail: string): Promise<boolean> {
    try {
      logger.info(`🚫 Revoking share: ${shareId}`)

      const sharesTableId = `${this.tableId}_shares`
      
      const query = `
        UPDATE \`${this.projectId}.${this.datasetId}.${sharesTableId}\`
        SET is_active = false
        WHERE share_id = @shareId AND shared_by = @userEmail
      `

      await this.bigquery.query({
        query,
        params: { shareId, userEmail }
      })

      logger.info(`✅ Share revoked successfully: ${shareId}`)
      return true

    } catch (error) {
      logger.error('❌ Failed to revoke share:', error)
      throw error
    }
  }

  private async updateShareViewCount(shareId: string): Promise<void> {
    try {
      const sharesTableId = `${this.tableId}_shares`
      
      const query = `
        UPDATE \`${this.projectId}.${this.datasetId}.${sharesTableId}\`
        SET 
          view_count = view_count + 1,
          last_viewed = CURRENT_TIMESTAMP()
        WHERE share_id = @shareId
      `

      await this.bigquery.query({
        query,
        params: { shareId }
      })

    } catch (error) {
      logger.warn('⚠️ Failed to update view count:', error)
      // Don't throw error as this is non-critical
    }
  }

  private async createSharesTable(): Promise<void> {
    try {
      logger.info('🏗️ Creating shares table...')

      const sharesTableId = `${this.tableId}_shares`
      
      const schema = [
        { name: 'share_id', type: 'STRING', mode: 'REQUIRED' },
        { name: 'analysis_id', type: 'STRING', mode: 'REQUIRED' },
        { name: 'shared_by', type: 'STRING', mode: 'REQUIRED' },
        { name: 'shared_with', type: 'STRING', mode: 'REQUIRED' },
        { name: 'brand_name', type: 'STRING', mode: 'NULLABLE' },
        { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
        { name: 'expires_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
        { name: 'is_active', type: 'BOOLEAN', mode: 'REQUIRED' },
        { name: 'view_count', type: 'INTEGER', mode: 'REQUIRED' },
        { name: 'last_viewed', type: 'TIMESTAMP', mode: 'NULLABLE' }
      ]

      await this.bigquery
        .dataset(this.datasetId)
        .createTable(sharesTableId, { schema })

      logger.info('✅ Shares table created successfully')

    } catch (error) {
      logger.error('❌ Failed to create shares table:', error)
      throw error
    }
  }

  // NEW: User Role Management Methods
  async setUserRole(params: SetUserRoleParams): Promise<void> {
    try {
      logger.info(`👤 Setting user role: ${params.userEmail} -> ${params.role}`)

      await this.createUserRolesTableIfNotExists()

      const userRolesTableId = `${this.tableId}_user_roles`
      
      // Check if user already exists
      const checkQuery = `
        SELECT role 
        FROM \`${this.projectId}.${this.datasetId}.${userRolesTableId}\`
        WHERE user_email = @userEmail AND is_active = TRUE
      `

      const [existingRows] = await this.bigquery.query({
        query: checkQuery,
        params: { userEmail: params.userEmail }
      })

      if (existingRows.length > 0) {
        // Update existing role
        const updateQuery = `
          UPDATE \`${this.projectId}.${this.datasetId}.${userRolesTableId}\`
          SET role = @role
          WHERE user_email = @userEmail AND is_active = TRUE
        `

        await this.bigquery.query({
          query: updateQuery,
          params: { 
            role: params.role,
            userEmail: params.userEmail
          }
        })
      } else {
        // Insert new role
        const insertQuery = `
          INSERT INTO \`${this.projectId}.${this.datasetId}.${userRolesTableId}\`
          (user_email, role, created_at, created_by, is_active)
          VALUES (@userEmail, @role, CURRENT_TIMESTAMP(), @createdBy, TRUE)
        `

        await this.bigquery.query({
          query: insertQuery,
          params: {
            userEmail: params.userEmail,
            role: params.role,
            createdBy: params.createdBy
          }
        })
      }

      logger.info(`✅ User role set successfully: ${params.userEmail} -> ${params.role}`)

    } catch (error) {
      logger.error('❌ Failed to set user role:', error)
      throw error
    }
  }

  async getUserRole(userEmail: string): Promise<'admin' | 'regular' | null> {
    try {
      await this.createUserRolesTableIfNotExists()

      const userRolesTableId = `${this.tableId}_user_roles`
      
      const query = `
        SELECT role
        FROM \`${this.projectId}.${this.datasetId}.${userRolesTableId}\`
        WHERE user_email = @userEmail AND is_active = TRUE
        LIMIT 1
      `

      const [rows] = await this.bigquery.query({
        query,
        params: { userEmail }
      })

      return rows.length > 0 ? rows[0].role : null

    } catch (error) {
      logger.warn('⚠️ Failed to get user role, defaulting to regular:', error)
      return 'regular' // Default to regular user if there's an error
    }
  }

  async grantAnalysisPermission(params: CreatePermissionParams): Promise<string> {
    try {
      logger.info(`🔐 Granting analysis permission: ${params.analysisId} -> ${params.userEmail}`)

      await this.createAnalysisPermissionsTableIfNotExists()

      const permissionId = `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const permissionsTableId = `${this.tableId}_analysis_permissions`
      
      const query = `
        INSERT INTO \`${this.projectId}.${this.datasetId}.${permissionsTableId}\`
        (permission_id, analysis_id, user_email, granted_by, granted_at, is_active, brand_name, category)
        VALUES (@permissionId, @analysisId, @userEmail, @grantedBy, CURRENT_TIMESTAMP(), TRUE, @brandName, @category)
      `

      await this.bigquery.query({
        query,
        params: {
          permissionId,
          analysisId: params.analysisId,
          userEmail: params.userEmail,
          grantedBy: params.grantedBy,
          brandName: params.brandName,
          category: params.category
        }
      })

      logger.info(`✅ Analysis permission granted: ${permissionId}`)
      return permissionId

    } catch (error) {
      logger.error('❌ Failed to grant analysis permission:', error)
      throw error
    }
  }

  async getUserAccessibleAnalyses(userEmail: string): Promise<AnalysisRecord[]> {
    try {
      const userRole = await this.getUserRole(userEmail)
      
      if (userRole === 'admin') {
        // Admin gets all analyses
        return await this.getAnalyses()
      }

      // Regular users get only permitted analyses
      await this.createAnalysisPermissionsTableIfNotExists()

      const permissionsTableId = `${this.tableId}_analysis_permissions`
      
      const query = `
        SELECT a.*
        FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\` a
        INNER JOIN \`${this.projectId}.${this.datasetId}.${permissionsTableId}\` p
        ON a.brand_name = p.brand_name
        WHERE p.user_email = @userEmail 
        AND p.is_active = TRUE
        AND (
          a.brand_name IS NOT NULL 
          AND a.brand_name != '' 
          AND a.category IS NOT NULL 
          AND a.category != ''
        )
        ORDER BY a.created_at DESC
      `

      const [rows] = await this.bigquery.query({
        query,
        params: { userEmail }
      })

      logger.info(`📊 Found ${rows.length} accessible analyses for user ${userEmail}`)
      return rows as AnalysisRecord[]

    } catch (error) {
      logger.error('❌ Failed to get user accessible analyses:', error)
      throw error
    }
  }

  async getUserPermissions(userEmail: string): Promise<AnalysisPermission[]> {
    try {
      await this.createAnalysisPermissionsTableIfNotExists()

      const permissionsTableId = `${this.tableId}_analysis_permissions`
      
      const query = `
        SELECT *
        FROM \`${this.projectId}.${this.datasetId}.${permissionsTableId}\`
        WHERE user_email = @userEmail AND is_active = TRUE
        ORDER BY granted_at DESC
      `

      const [rows] = await this.bigquery.query({
        query,
        params: { userEmail }
      })

      return rows as AnalysisPermission[]

    } catch (error) {
      logger.error('❌ Failed to get user permissions:', error)
      throw error
    }
  }

  async getAllUsers(): Promise<UserRole[]> {
    try {
      await this.createUserRolesTableIfNotExists()

      const userRolesTableId = `${this.tableId}_user_roles`
      
      const query = `
        SELECT *
        FROM \`${this.projectId}.${this.datasetId}.${userRolesTableId}\`
        WHERE is_active = TRUE
        ORDER BY created_at DESC
      `

      const [rows] = await this.bigquery.query({ query })
      return rows as UserRole[]

    } catch (error) {
      logger.error('❌ Failed to get all users:', error)
      throw error
    }
  }

  async getAnalysisPermissions(analysisId: string): Promise<AnalysisPermission[]> {
    try {
      await this.createAnalysisPermissionsTableIfNotExists()

      const permissionsTableId = `${this.tableId}_analysis_permissions`
      
      const query = `
        SELECT *
        FROM \`${this.projectId}.${this.datasetId}.${permissionsTableId}\`
        WHERE analysis_id = @analysisId AND is_active = TRUE
        ORDER BY granted_at DESC
      `

      const [rows] = await this.bigquery.query({
        query,
        params: { analysisId }
      })

      return rows as AnalysisPermission[]

    } catch (error) {
      logger.error('❌ Failed to get analysis permissions:', error)
      throw error
    }
  }

  async migrateAnalysisPermissions(): Promise<{ success: boolean }> {
    try {
      logger.info('🔧 Starting analysis permissions migration...')
      
      await this.createAnalysisPermissionsTableIfNotExists()
      
      const permissionsTableId = `${this.tableId}_analysis_permissions`
      
      // Update existing permissions to use the new ID format
      const migrationQuery = `
        UPDATE \`${this.projectId}.${this.datasetId}.${permissionsTableId}\` p
        SET analysis_id = (
          SELECT CONCAT(a.brand_name, '_', CAST(UNIX_MILLIS(a.created_at) AS STRING))
          FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\` a
          WHERE p.brand_name = a.brand_name
          AND p.category = a.category
          AND ABS(UNIX_MILLIS(a.created_at) - CAST(REGEXP_EXTRACT(p.analysis_id, r'_(.*)$') AS INT64)) < 2000
          LIMIT 1
        )
        WHERE p.analysis_id IS NOT NULL
        AND p.brand_name IS NOT NULL
        AND p.category IS NOT NULL
      `

      await this.bigquery.query({
        query: migrationQuery
      })

      logger.info('✅ Analysis permissions migration completed')
      
      return { success: true }
      
    } catch (error) {
      logger.error('❌ Analysis permissions migration failed:', error)
      throw error
    }
  }

  private async createUserRolesTableIfNotExists(): Promise<void> {
    try {
      const userRolesTableId = `${this.tableId}_user_roles`
      
      // Check if table exists
      const dataset = this.bigquery.dataset(this.datasetId)
      const table = dataset.table(userRolesTableId)
      
      const [exists] = await table.exists()
      
      if (!exists) {
        logger.info('🏗️ Creating user roles table...')
        
        const schema = [
          { name: 'user_email', type: 'STRING', mode: 'REQUIRED' },
          { name: 'role', type: 'STRING', mode: 'REQUIRED' },
          { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
          { name: 'created_by', type: 'STRING', mode: 'REQUIRED' },
          { name: 'is_active', type: 'BOOLEAN', mode: 'REQUIRED' }
        ]

        await dataset.createTable(userRolesTableId, { schema })
        logger.info('✅ User roles table created successfully')
      }

    } catch (error) {
      logger.error('❌ Failed to create user roles table:', error)
      throw error
    }
  }

  async createAnalysisPermissionsTableIfNotExists(): Promise<void> {
    try {
      const permissionsTableId = `${this.tableId}_analysis_permissions`
      
      // Check if table exists
      const dataset = this.bigquery.dataset(this.datasetId)
      const table = dataset.table(permissionsTableId)
      
      const [exists] = await table.exists()
      
      if (!exists) {
        logger.info('🏗️ Creating analysis permissions table...')
        
        const schema = [
          { name: 'permission_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'analysis_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'user_email', type: 'STRING', mode: 'REQUIRED' },
          { name: 'granted_by', type: 'STRING', mode: 'REQUIRED' },
          { name: 'granted_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
          { name: 'is_active', type: 'BOOLEAN', mode: 'REQUIRED' },
          { name: 'brand_name', type: 'STRING', mode: 'NULLABLE' },
          { name: 'category', type: 'STRING', mode: 'NULLABLE' }
        ]

        await dataset.createTable(permissionsTableId, { schema })
        logger.info('✅ Analysis permissions table created successfully')
      }

    } catch (error) {
      logger.error('❌ Failed to create analysis permissions table:', error)
      throw error
    }
  }
  
  // Public method for setup and administrative queries
  async runSetupQueries(userEmail: string): Promise<{
    analysesInMainTable: number,
    existingPermissions: number,
    newPermissionsCreated: number,
    accessibleAnalyses: number,
    sampleAnalyses: any[],
    accessibleAnalysesDetails: any[]
  }> {
    try {
      logger.info('🔧 Starting BigQuery setup for user:', userEmail)

      // Step 1: Check main table
      const mainTableQuery = `
        SELECT 
          client_name,
          brand_name,
          category,
          website,
          created_at,
          LENGTH(analysis) as analysis_length
        FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
        WHERE brand_name IS NOT NULL 
        AND brand_name != ''
        AND category IS NOT NULL 
        AND category != ''
        ORDER BY created_at DESC 
        LIMIT 10
      `

      const [mainTableRows] = await this.bigquery.query({ query: mainTableQuery })
      logger.info(`Found ${mainTableRows.length} analyses in main table`)

      if (mainTableRows.length === 0) {
        throw new Error('No analyses found in perception table')
      }

      // Step 2: Create permissions table
      await this.createAnalysisPermissionsTableIfNotExists()

      // Step 3: Check existing permissions
      const permissionsTableId = `${this.tableId}_analysis_permissions`
      const existingPermissionsQuery = `
        SELECT COUNT(*) as count
        FROM \`${this.projectId}.${this.datasetId}.${permissionsTableId}\`
        WHERE user_email = @userEmail AND is_active = TRUE
      `

      const [existingRows] = await this.bigquery.query({
        query: existingPermissionsQuery,
        params: { userEmail }
      })

      const existingCount = existingRows[0]?.count || 0
      logger.info(`User has ${existingCount} existing permissions`)

      let newPermissionsCreated = 0

      // Step 4: Create permissions if none exist
      if (existingCount === 0) {
        logger.info('🔑 Creating permissions for user...')
        
        const createPermissionsQuery = `
          INSERT INTO \`${this.projectId}.${this.datasetId}.${permissionsTableId}\` 
          (permission_id, analysis_id, user_email, granted_by, brand_name, category, is_active, created_at)
          SELECT 
            GENERATE_UUID() as permission_id,
            brand_name as analysis_id,
            @userEmail as user_email,
            'auto_setup' as granted_by,
            brand_name,
            category,
            TRUE as is_active,
            CURRENT_TIMESTAMP() as created_at
          FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
          WHERE brand_name IS NOT NULL 
          AND brand_name != ''
          AND category IS NOT NULL 
          AND category != ''
          ORDER BY created_at DESC
          LIMIT 5
        `

        await this.bigquery.query({
          query: createPermissionsQuery,
          params: { userEmail }
        })

        newPermissionsCreated = Math.min(5, mainTableRows.length)
        logger.info(`✅ Created ${newPermissionsCreated} permissions`)
      }

      // Step 5: Verify setup
      const verifyQuery = `
        SELECT 
          p.analysis_id,
          p.brand_name,
          p.category,
          a.created_at
        FROM \`${this.projectId}.${this.datasetId}.${permissionsTableId}\` p
        JOIN \`${this.projectId}.${this.datasetId}.${this.tableId}\` a
        ON a.brand_name = p.brand_name
        WHERE p.user_email = @userEmail 
        AND p.is_active = TRUE
        ORDER BY a.created_at DESC
        LIMIT 5
      `

      const [verifyRows] = await this.bigquery.query({
        query: verifyQuery,
        params: { userEmail }
      })

      logger.info(`✅ Verification: User can access ${verifyRows.length} analyses`)

      return {
        analysesInMainTable: mainTableRows.length,
        existingPermissions: existingCount,
        newPermissionsCreated,
        accessibleAnalyses: verifyRows.length,
        sampleAnalyses: mainTableRows.slice(0, 3),
        accessibleAnalysesDetails: verifyRows
      }

    } catch (error) {
      logger.error('❌ Setup failed:', error)
      throw error
    }
  }
}

// Singleton instance
let bigQueryService: BigQueryService | null = null

export function getBigQueryService(): BigQueryService {
  if (!bigQueryService) {
    bigQueryService = new BigQueryService()
  }
  return bigQueryService
}

export type { AnalysisRecord, SaveAnalysisParams, SearchFilters, ShareRecord, CreateShareParams, UserRole, AnalysisPermission, CreatePermissionParams, SetUserRoleParams }
