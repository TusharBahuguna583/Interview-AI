import { useContext } from 'react';
import { VapiContext } from '../vapi.context';

export const useVapi = () => {
    const context = useContext(VapiContext);
    if (!context) {
        throw new Error("useVapi must be used within a VapiProvider");
    }
    return context;
};
