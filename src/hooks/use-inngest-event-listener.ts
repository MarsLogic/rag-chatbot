// src/hooks/use-inngest-event-listener.ts

import { useEffect } from 'react';

// This hook sets up a listener for Inngest events on the client-side.
// It allows our UI to react in real-time to background job completions.

export const useInngestEventListener = (
  eventName: string,
  listener: (event: any) => void
) => {
  useEffect(() => {
    // Inngest's client-side listener uses an EventSource (Server-Sent Events)
    // to connect to the dev server's event stream, which is our API route.
    const eventSource = new EventSource('/api/inngest');

    const handleEvent = (event: MessageEvent) => {
      // We need to try-catch here because the stream can send non-JSON data
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.name === eventName) {
          listener(parsedData);
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    };

    eventSource.addEventListener('message', handleEvent);

    // Clean up the connection when the component unmounts
    return () => {
      eventSource.removeEventListener('message', handleEvent);
      eventSource.close();
    };
  }, [eventName, listener]);
};