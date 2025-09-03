import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryService } from '../../../lib/bigquery'

const bigQueryService = getBigQueryService()

export async function POST(request: NextRequest) {
  try {
    // Simple setup endpoint to make jad.khattib@monks.com admin
    console.log('Setting up admin user: jad.khattib@monks.com')

    await bigQueryService.setUserRole({
      userEmail: 'jad.khattib@monks.com',
      role: 'admin',
      createdBy: 'manual-setup'
    })

    console.log('Successfully set jad.khattib@monks.com as admin')

    return NextResponse.json({ 
      success: true, 
      message: 'jad.khattib@monks.com has been set as admin',
      adminEmail: 'jad.khattib@monks.com'
    })

  } catch (error) {
    console.error('Failed to setup admin:', error)
    return NextResponse.json({ 
      error: 'Failed to setup admin user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 