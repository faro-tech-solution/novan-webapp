import { NextRequest, NextResponse } from 'next/server';
import { SpotPlayerService } from '@/services/spotPlayerService';

export async function GET(request: NextRequest) {
  try {
    // Get the X cookie from the request
    const cookieHeader = request.headers.get('cookie');
    const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>) || {};

    const existingCookie = cookies['X'];

    if (!existingCookie) {
      // No existing cookie, create a new one
      const newCookieValue = `${Date.now().toString(16)}${Math.random().toString(16).substr(2)}`;
      
      const response = NextResponse.json({ success: true, cookie: newCookieValue });
      response.cookies.set('X', newCookieValue, {
        maxAge: 365 * 24 * 60 * 60 * 100, // 100 years
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
        sameSite: 'lax'
      });
      
      return response;
    }

    // Check if cookie is still valid
    if (SpotPlayerService.isCookieValid(existingCookie)) {
      return NextResponse.json({ success: true, cookie: existingCookie });
    }

    // Cookie is expired, refresh it
    try {
      const refreshedCookie = await SpotPlayerService.refreshCookie(existingCookie);
      
      const response = NextResponse.json({ success: true, cookie: refreshedCookie });
      response.cookies.set('X', refreshedCookie, {
        maxAge: 365 * 24 * 60 * 60 * 100, // 100 years
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
        sameSite: 'lax'
      });
      
      return response;
    } catch (error) {
      console.error('Error refreshing SpotPlayer cookie:', error);
      
      // If refresh fails, create a new cookie
      const newCookieValue = `${Date.now().toString(16)}${Math.random().toString(16).substr(2)}`;
      
      const response = NextResponse.json({ success: true, cookie: newCookieValue });
      response.cookies.set('X', newCookieValue, {
        maxAge: 365 * 24 * 60 * 60 * 100, // 100 years
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
        sameSite: 'lax'
      });
      
      return response;
    }
  } catch (error) {
    console.error('Error in SpotPlayer cookie route:', error);
    return NextResponse.json(
      { error: 'Failed to handle SpotPlayer cookie' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create a new cookie for the user
    const cookieValue = await SpotPlayerService.getOrCreateCookie(userId);
    
    const response = NextResponse.json({ success: true, cookie: cookieValue });
    response.cookies.set('X', cookieValue, {
      maxAge: 365 * 24 * 60 * 60 * 100, // 100 years
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
      sameSite: 'lax'
    });
    
    return response;
  } catch (error) {
    console.error('Error creating SpotPlayer cookie:', error);
    return NextResponse.json(
      { error: 'Failed to create SpotPlayer cookie' },
      { status: 500 }
    );
  }
}