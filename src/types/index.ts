// src/types/index.ts

// This file defines the explicit "contracts" for all Inngest events
// in our application. By defining them here, we get end-to-end
// type safety and intellisense, and we prevent TypeScript errors
// during the build process on Vercel.

export type Events = {
  // This is the event sent when a file is uploaded and a
  // database record is created. It triggers the main processing function.
  'app/document.uploaded': {
    data: {
      documentId: string;
    };
  };

  // This is the event sent AFTER the document has been successfully
  // processed. We use this to trigger real-time UI updates.
  'app/document.processed': {
    data: {
      documentId: string;
      status: 'PROCESSED' | 'FAILED';
    };
  };

  // This is our simple test event.
  'test/hello.world': {
    data: {}; // No data for this event
  };
};