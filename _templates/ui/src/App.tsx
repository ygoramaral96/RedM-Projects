import { useState, useEffect } from 'react';
import { RedButton } from '@project/ui-kit';
import { useNuiEvent } from './hooks/useNuiEvent';
import { fetchNui } from './utils/fetchNui';

interface NuiMessage {
  action: string;
  data: any;
}

function App() {
  const [visible, setVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Welcome to Template Resource!');

  // Listen for visibility changes from the C# backend
  useNuiEvent<{ visible: boolean }>('setVisible', (data) => {
    setVisible(data.visible);
  });

  // Listen for custom messages from the C# backend
  useNuiEvent<{ message: string }>('updateMessage', (data) => {
    setMessage(data.message);
  });

  // Handle ESC key to close UI
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setVisible(false);
        fetchNui('hideUI', {});
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleButtonClick = async () => {
    const response = await fetchNui<{ status: string; message: string }>('sampleAction', {
      someData: 'Hello from React!',
    });

    if (response) {
      console.log('Response from C#:', response);
      setMessage(response.message);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-4">Template Resource</h1>
        <p className="text-gray-300 mb-6">{message}</p>
        
        <div className="space-y-4">
          <RedButton onClick={handleButtonClick} variant="primary">
            Send Action to Backend
          </RedButton>
          
          <RedButton 
            onClick={() => {
              setVisible(false);
              fetchNui('hideUI', {});
            }} 
            variant="secondary"
          >
            Close
          </RedButton>
        </div>
      </div>
    </div>
  );
}

export default App;

