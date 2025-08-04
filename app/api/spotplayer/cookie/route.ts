import { NextRequest, NextResponse } from 'next/server';
import { SpotPlayerService } from '@/services/spotPlayerService';

// This endpoint is used by SpotPlayer's JavaScript API for cookie management
export async function HEAD(request: NextRequest) {
  try {
    // Get the existing cookie from the request
    const cookieHeader = request.headers.get('cookie');
    let existingCookie = '';
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'X') {
          existingCookie = value;
          break;
        }
      }
    }

    if (!existingCookie) {
      // Generate a new cookie if none exists
      const timestamp = Date.now();
      const randomPart = Math.random().toString(16).substr(2);
      existingCookie = `${timestamp.toString(16)}${randomPart}`;
    } else {
      // Refresh the existing cookie
      try {
        existingCookie = await SpotPlayerService.refreshCookie(existingCookie);
      } catch (error) {
        console.error('Error refreshing cookie:', error);
        // Generate a new cookie if refresh fails
        const timestamp = Date.now();
        const randomPart = Math.random().toString(16).substr(2);
        existingCookie = `${timestamp.toString(16)}${randomPart}`;
      }
    }

    // Set the cookie in the response
    const response = new NextResponse('', { status: 200 });
    response.headers.set(
      'Set-Cookie', 
      `X=${existingCookie}; Path=/; HttpOnly=false; Secure=true; SameSite=None; Max-Age=${365 * 24 * 60 * 60}`
    );

    return response;
  } catch (error) {
    console.error('Error in SpotPlayer cookie endpoint:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}