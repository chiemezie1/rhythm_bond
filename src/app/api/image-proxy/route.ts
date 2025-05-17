import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the URL from the query parameter
  const url = request.nextUrl.searchParams.get('url');
  
  // If no URL is provided, return a 400 error
  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }
  
  try {
    // Fetch the image from the external source
    const imageResponse = await fetch(url);
    
    // If the fetch fails, return a 404 error
    if (!imageResponse.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }
    
    // Get the image data as an array buffer
    const imageData = await imageResponse.arrayBuffer();
    
    // Get the content type from the response
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Return the image with the appropriate content type
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
