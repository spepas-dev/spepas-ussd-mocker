import { SetStateAction, useState, useTransition } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { baseEndpoint } from '../api/calls';
type USSDRequest = {
  msisdn?: string; // User's phone number (MSISDN)
  requestType?: string;
  menuContent?: string;
  sessionId?: string; // Unique session identifier
  currentMenu: string; // Current USSD menu state
  operator: string; // Mobile network operator (e.g., "MTN")
  userInput?: string; // User's input (e.g., selecting an option)
  shortCode?: string; // USSD shortcode used to initiate the session
};

const BuyerUssd = () => {
  const [screen, setScreen] = useState<USSDRequest>({
    msisdn: '',
    requestType: 'START',
    menuContent: '',
    sessionId: '',
    currentMenu: 'ROOT',
    operator: 'MTN',
    userInput: '1',
    shortCode: ''
  });
  const [input, setInput] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const handleInput = (e: { target: { value: SetStateAction<string> } }) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    startTransition(async () => {
      switch (screen.requestType) {
        case 'INITIATION': {
          const uniqueId = uuidv4(); // Generate UUID

          const data = {
            ...screen,
            sessionId: uniqueId,
            shortCode: input,
            requestType: 'INITIATION'
          };
          const response = await baseEndpoint(data);

          setScreen((prevState) => ({
            ...prevState,
            ...response
          }));
          break;
        }
        case 'EXISTING': {
          const data = {
            ...screen,
            userInput: input
          };
          const response = await baseEndpoint(data);
          setScreen((prevState) => ({
            ...prevState,
            ...response
          }));

          if (response.requestType === 'CLEANUP') {
            setTimeout(async () => {
              const uniqueId = uuidv4(); // Generate UUID
              const data1 = {
                ...response,
                sessionId: uniqueId,
                currentMenu: 'ROOT',
                operator: 'MTN',
                userInput: '1',
                shortCode: '*887*9#',
                requestType: 'INITIATION'
              };
              const response1 = await baseEndpoint(data1);
              setScreen((prevState) => ({
                ...prevState,
                ...response1
              }));
            }, 5000); // 3 seconds delay
          }
          break;
        }
        default: {
          const newDetails = {
            msisdn: input,
            requestType: 'INITIATION'
          };
          setScreen((prevState) => ({
            ...prevState,
            ...newDetails
          }));
        }
      }
      setInput('');
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white shadow-lg rounded-lg w-80 p-10">
        <h2 className="text-xl font-bold mb-2">Spepa Buyer USSD</h2>
        {(screen.requestType === 'EXISTING' || screen.requestType === 'CLEANUP') && (
          <div className="bg-gray-100 p-4 rounded-lg min-h-24 text-start">
            {screen?.menuContent?.split('\n').map((line, index) => (
              <p key={index}>{line}</p> // Each line becomes a separate <p>
            ))}
            {/* <p>{screen?.menuContent}</p> */}
          </div>
        )}

        {screen.requestType !== 'CLEANUP' && (
          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="text"
              value={input}
              onChange={handleInput}
              className="w-full p-2 border rounded"
              placeholder={
                screen.requestType === 'START'
                  ? 'Enter Your Phone number'
                  : screen.requestType === 'INITIATION'
                    ? 'Dail Shortcode *887*9#'
                    : 'Enter your option ( eg. 1 )'
              }
            />
            {isPending ? (
              <button type="submit" className="w-full bg-blue-500 text-white mt-4 p-2 rounded" disabled={isPending}>
                Processing....
              </button>
            ) : (
              <button type="submit" className="w-full bg-blue-500 text-white mt-4 p-2 rounded">
                {screen.requestType === 'START' ? 'Start' : 'Submit'}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default BuyerUssd;
