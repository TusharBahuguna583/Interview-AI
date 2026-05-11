import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

const vapiPublicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;

export const VapiContext = createContext();

export const VapiProvider = ({ children }) => {
    const vapi = useRef(null);
    const [callStatus, setCallStatus] = useState('inactive'); 
    const [isMuted, setIsMuted] = useState(false);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(devices => {
            devices.filter(d => d.kind === 'audioinput').forEach(d => {
            });
        });

        if (vapiPublicKey && vapiPublicKey !== 'your_public_key_here') {
            try {
                if (vapi.current) {
                    try { vapi.current.stop(); } catch(e) {}
                }
                
                vapi.current = new Vapi(vapiPublicKey);

                const onCallStart = () => {
                    setCallStatus('active');
                    if (vapi.current) {
                        vapi.current.setMuted(false);
                    }
                }
                const onCallEnd = () => {
                    setCallStatus('inactive');
                }
                const onError = (e) => {
                    setCallStatus('error');
                };

                const onMessage = (message) => {
                    if (message.type === 'conversation-update') {
                        const newMessages = message.conversation.filter(msg => msg.role !== 'system').map(msg => ({
                            role: msg.role === 'bot' ? 'assistant' : msg.role,
                            text: msg.content,
                            timestamp: new Date()
                        }));
                        setMessages(newMessages);
                    }
                };

                const onVolumeLevel = (level) => {
                };

                const onSpeechUpdate = (data) => {
                    if (data.status === 'stopped' && data.role === 'assistant') {
                    }
                };

                vapi.current.on('call-start', onCallStart);
                vapi.current.on('call-end', onCallEnd);
                vapi.current.on('error', onError);
                vapi.current.on('message', onMessage);
                vapi.current.on('volume-level', onVolumeLevel);
                vapi.current.on('speech-update', onSpeechUpdate);

                return () => {
                    if (vapi.current) {
                        vapi.current.off('call-start', onCallStart);
                        vapi.current.off('call-end', onCallEnd);
                        vapi.current.off('error', onError);
                        vapi.current.off('message', onMessage);
                        vapi.current.off('volume-level', onVolumeLevel);
                        vapi.current.off('speech-update', onSpeechUpdate);
                    }
                };
            } catch (err) {
                setCallStatus('error');
            }
        }
    }, [vapiPublicKey]);

    const startCall = useCallback(async (report) => {
        if (!assistantId || assistantId === 'your_assistant_id_here') {
            setCallStatus('error');
            return;
        }

        if (!vapi.current) {
            try {
                vapi.current = new Vapi(vapiPublicKey);
            } catch (e) {
                setCallStatus('error');
                return;
            }
        }

        try {
            setCallStatus('connecting');
            setMessages([]);

            const truncate = (text, length = 800) => {
                if (!text) return "";
                return text.length > length ? text.substring(0, length) + "..." : text;
            };

            const assistantOverrides = {
                firstMessage: "Hello! I'm your AI interviewer today. I have your resume and the job description here. Shall we get started?",
                variableValues: {
                    jobDescription: truncate(report.jobDescription),
                    resume: truncate(report.resume || report.selfDescription)
                },
                transcriber: {
                    provider: "deepgram",
                    model: "nova-2",
                    language: "en-US"
                },
                model: {
                    provider: "openai",
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content: `You are an expert AI Interviewer. 
                            
                            JOB DESCRIPTION:
                            ${truncate(report.jobDescription, 500)}
                            
                            CANDIDATE RESUME:
                            ${truncate(report.resume || report.selfDescription, 1000)}
                            
                            Your task is to conduct a professional interview. Start by welcoming the candidate and then ask one technical question at a time based on the job and their resume.`
                        }
                    ]
                }
            };

            const call = await vapi.current.start(assistantId, assistantOverrides);
        } catch (err) {
            setCallStatus('error');
        }
    }, []);

    const stopCall = useCallback(async () => {
        if (vapi.current) {
            vapi.current.stop();
        }
        setCallStatus('inactive');
    }, []);

    const toggleMute = useCallback(() => {
        if (vapi.current) {
            vapi.current.setMuted(!isMuted);
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    return (
        <VapiContext.Provider value={{ 
            startCall, 
            stopCall, 
            toggleMute, 
            isMuted, 
            callStatus, 
            messages, 
            isActive: callStatus === 'active' || callStatus === 'connecting' 
        }}>
            {children}
        </VapiContext.Provider>
    );
};

