import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  Avatar,
  Stack,
  alpha,
  useTheme,
  Chip,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  RefreshCw,
  ShoppingCart,
  Store,
  CheckCircle,
  HelpCircle,
  Truck,
  DollarSign,
  MapPin,
  Clock,
} from 'lucide-react';
import logger from '../utils/logger.js';

// Dialogue States
const STATES = {
  INIT: 0,
  AUDIO_VERIFY: 1,
  STORE_SELECT: 2,
  ACCOUNT_CONFIRM: 3,
  GROCERY_LOOP: 4,
  CART_REVIEW: 5,
  CHECKOUT_STEPS: 6,
  CHECKOUT_COMPLETE: 7,
};

const VoiceChatBox = ({
  user,
  currentItems = [],
  onAddItem,
  onSelectVendor,
  onTriggerCheckout,
  onAuthRedirect,
  onTypingSimulated,
}) => {
  const theme = useTheme();
  const [chatState, setChatState] = useState(STATES.INIT);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [checkoutStepIndex, setCheckoutStepIndex] = useState(0);

  // References for Web APIs
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const stateRef = useRef(chatState);

  // Keep state reference sync'd for events
  useEffect(() => {
    stateRef.current = chatState;
  }, [chatState]);

  // Voice synthesis feedback helper
  const speakText = useCallback((text) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.name.includes('Google US English') ||
          v.name.includes('Google') ||
          v.lang === 'en-US'
      );
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 1.05; // Slightly faster for natural rhythm
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      logger.error('Failed voice synthesis:', e);
    }
  }, [soundEnabled]);

  // Scroll chat messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add message helper
  const addMessage = useCallback((text, sender = 'ai', options = null) => {
    setMessages((prev) => [...prev, { text, sender, options, timestamp: new Date() }]);
    if (sender === 'ai') {
      speakText(text);
    }
  }, [speakText]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Stop after one phrase
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          handleUserInput(transcript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (err) => {
        logger.error('Speech recognition error:', err);
        setIsListening(false);
      };
    }
  }, [chatState, selectedVendor, checkoutStepIndex]);

  // Handle Speech Toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Step 1: Greeting on Mount
  useEffect(() => {
    if (chatState === STATES.INIT) {
      const greeting = "Hi, my name is OrderBay AI. Welcome to Orderbay. First, let's verify that your speaker is enabled. Click the sound button below if you can hear me!";
      addMessage(greeting, 'ai', [
        { label: '🔊 I Can Hear You', value: 'verify_audio' }
      ]);
      setChatState(STATES.AUDIO_VERIFY);
    }
  }, [chatState, addMessage]);

  // Dialogue Tree State Machine logic
  const handleUserInput = (input) => {
    const cleanInput = input.trim().toLowerCase();
    addMessage(input, 'user');
    setInputText('');

    if (stateRef.current === STATES.GROCERY_LOOP && onTypingSimulated) {
      onTypingSimulated(inputToCleanText(input));
      setTimeout(() => {
        onTypingSimulated('');
      }, 2500);
    }

    setTimeout(() => {
      processDialogue(cleanInput);
    }, 800);
  };

  const processDialogue = (cleanInput) => {
    const currentState = stateRef.current;

    if (currentState === STATES.AUDIO_VERIFY) {
      addMessage("Audio verification complete! Microphone and speaker are configured. Which store will you be shopping at today? Do you want to see a list of stores?", 'ai', [
        { label: 'Walmart', value: 'select_walmart' },
        { label: 'Instacart (Publix)', value: 'select_instacart' }
      ]);
      setChatState(STATES.STORE_SELECT);
    } 
    
    else if (currentState === STATES.STORE_SELECT) {
      let store = '';
      if (cleanInput.includes('walmart') || cleanInput.includes('select_walmart')) {
        store = 'Walmart';
        setSelectedVendor({ id: 'walmart', name: 'Walmart' });
        if (onSelectVendor) onSelectVendor({ id: 'walmart', name: 'Walmart' });
      } else if (cleanInput.includes('instacart') || cleanInput.includes('select_instacart') || cleanInput.includes('publix')) {
        store = 'Instacart';
        setSelectedVendor({ id: 'instacart', name: 'Instacart' });
        if (onSelectVendor) onSelectVendor({ id: 'instacart', name: 'Instacart' });
      } else {
        addMessage("Sorry, I didn't catch that store name. Please choose Walmart or Instacart.", 'ai', [
          { label: 'Walmart', value: 'select_walmart' },
          { label: 'Instacart (Publix)', value: 'select_instacart' }
        ]);
        return;
      }

      addMessage(`Perfect choice! ${store} selected. Do you have an account with the selected store?`, 'ai', [
        { label: 'Yes, I do', value: 'account_yes' },
        { label: 'No, shop as Guest', value: 'account_no' }
      ]);
      setChatState(STATES.ACCOUNT_CONFIRM);
    } 
    
    else if (currentState === STATES.ACCOUNT_CONFIRM) {
      if (!user) {
        addMessage("Wonderful! To save your list and sync securely, please sign in or create an account first.", 'ai', [
          { label: '🔑 Sign In / Register Now', value: 'auth_redirect' }
        ]);
        return;
      }

      addMessage("Got it. Account status confirmed. Tell me your first item. You can speak your selections or enter the text in the chat box.", 'ai');
      setChatState(STATES.GROCERY_LOOP);
    } 
    
    else if (currentState === STATES.GROCERY_LOOP) {
      if (cleanInput === 'done' || cleanInput === 'checkout' || cleanInput.includes('no more') || cleanInput.includes('finished')) {
        addMessage("Got it. Let's review. Is there anything else you want to add to your cart before we check-out?", 'ai', [
          { label: 'Yes, add items', value: 'review_yes' },
          { label: 'No, let\'s checkout', value: 'review_no' }
        ]);
        setChatState(STATES.CART_REVIEW);
        return;
      }

      // Add item to grocery list hook
      if (onAddItem) {
        onAddItem([inputToCleanText(cleanInput)]);
      }

      addMessage(`Added "${cleanInput}" to your list! What's next? Speak/type another item, or say "done" when finished.`, 'ai');
    } 
    
    else if (currentState === STATES.CART_REVIEW) {
      if (cleanInput.includes('yes') || cleanInput.includes('review_yes')) {
        addMessage("Okay, go ahead and say or type more items! Say 'done' when you are finished.", 'ai');
        setChatState(STATES.GROCERY_LOOP);
      } else {
        // Start checkout loop
        addMessage("Perfect. Let's verify your delivery details for checkout. Step 1: Please verify your delivery address. Is it correct?", 'ai', [
          { label: 'Address is Correct', value: 'address_correct' }
        ]);
        setChatState(STATES.CHECKOUT_STEPS);
        setCheckoutStepIndex(0);
      }
    } 
    
    else if (currentState === STATES.CHECKOUT_STEPS) {
      const stepIndex = checkoutStepIndex;

      if (stepIndex === 0) {
        addMessage("Address verified. Step 2: Verify today or a specific day for delivery.", 'ai', [
          { label: 'Today', value: 'delivery_today' },
          { label: 'Tomorrow', value: 'delivery_tomorrow' }
        ]);
        setCheckoutStepIndex(1);
      } else if (stepIndex === 1) {
        addMessage("Delivery day confirmed. Step 3: Verify the preferred date and time slot for delivery.", 'ai', [
          { label: 'ASAP (Next available)', value: 'time_asap' },
          { label: 'Evening slot (5 PM - 7 PM)', value: 'time_evening' }
        ]);
        setCheckoutStepIndex(2);
      } else if (stepIndex === 2) {
        addMessage("Time slot confirmed. Step 4: Confirm the tip amount for the delivery person.", 'ai', [
          { label: '$5.00 Standard', value: 'tip_5' },
          { label: '15% Recommended', value: 'tip_15' }
        ]);
        setCheckoutStepIndex(3);
      } else if (stepIndex === 3) {
        addMessage("Tip confirmed. Step 5: Any delivery instructions? (e.g. Leave at front door, ring bell, handoff)", 'ai', [
          { label: 'Leave at front door', value: 'instruction_front' },
          { label: 'Meet at door', value: 'instruction_meet' }
        ]);
        setCheckoutStepIndex(4);
      } else if (stepIndex === 4) {
        addMessage("Step 6: Everything looks perfect. Okay. Let's go to check-out? I will send the order to the store automation system.", 'ai', [
          { label: '🚀 Yes, Submit Order Now', value: 'checkout_confirm' }
        ]);
        setCheckoutStepIndex(5);
      } else if (stepIndex === 5) {
        addMessage("System is sending your order over to the automated agent and escalating submit order! Please watch the progress dashboard on screen.", 'ai');
        setChatState(STATES.CHECKOUT_COMPLETE);
        if (onTriggerCheckout && selectedVendor) {
          onTriggerCheckout(selectedVendor);
        }
      }
    }
  };

  const inputToCleanText = (str) => {
    return str.replace(/^(add|buy|get|need|want)\s+/i, '').trim();
  };

  const handleOptionClick = (optionValue) => {
    if (optionValue === 'auth_redirect') {
      if (onAuthRedirect) onAuthRedirect();
      return;
    }
    handleUserInput(optionValue);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        width: 380,
        height: 'calc(100vh - 120px)',
        position: 'fixed',
        right: 20,
        top: 96,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(20px)',
        bgcolor: alpha(theme.palette.background.paper, 0.92),
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.12)',
        zIndex: 1000,
      }}
    >
      {/* Panel Header */}
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              width: 40,
              height: 40,
              border: '2px solid rgba(255,255,255,0.6)',
            }}
          >
            🤖
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              OrderBay AI
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500 }}>
              Online Shopping Assistant
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5}>
          <Tooltip title={soundEnabled ? 'Mute AI' : 'Unmute AI'}>
            <IconButton
              size="small"
              onClick={() => setSoundEnabled(!soundEnabled)}
              sx={{ color: 'white' }}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Restart Conversation">
            <IconButton
              size="small"
              onClick={() => {
                setMessages([]);
                setChatState(STATES.INIT);
              }}
              sx={{ color: 'white' }}
            >
              <RefreshCw size={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Connection / Status Bar */}
      <Box sx={{ px: 2, py: 0.8, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Chip
          label={soundEnabled ? "Audio Feed active" : "Audio Feed muted"}
          size="small"
          variant="outlined"
          color={soundEnabled ? "success" : "default"}
          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
        />
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          Voice & Text enabled
        </Typography>
      </Box>

      {/* Messages Thread Container */}
      <Box
        sx={{
          flexGrow: 1,
          p: 2.5,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((msg, index) => {
          const isAi = msg.sender === 'ai';
          return (
            <Box
              key={index}
              sx={{
                alignSelf: isAi ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                {isAi && <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem' }}>🤖</Avatar>}
                <Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.8,
                      borderRadius: isAi ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                      bgcolor: isAi ? 'action.hover' : 'primary.main',
                      color: isAi ? 'text.primary' : 'white',
                      border: isAi ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.45 }}>
                      {msg.text}
                    </Typography>
                  </Paper>

                  {/* Stateful Options Buttons */}
                  {isAi && msg.options && (
                    <Stack spacing={1} direction="column" sx={{ mt: 1.5 }}>
                      {msg.options.map((opt, oIdx) => (
                        <Button
                          key={oIdx}
                          variant="outlined"
                          size="small"
                          onClick={() => handleOptionClick(opt.value)}
                          sx={{
                            textTransform: 'none',
                            justifyContent: 'flex-start',
                            borderRadius: '12px',
                            fontWeight: 600,
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: 'rgba(99, 102, 241, 0.05)',
                            },
                          }}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Waveform Animation (Visible while listening) */}
      {isListening && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, py: 1, bgcolor: 'rgba(99, 102, 241, 0.04)', borderTop: '1px solid', borderColor: 'divider' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Box
              key={i}
              sx={{
                width: 3,
                height: 12,
                borderRadius: 1,
                bgcolor: 'primary.main',
                animation: 'pulse 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scaleY(1)' },
                  '50%': { transform: 'scaleY(2.2)' },
                },
              }}
            />
          ))}
          <Typography variant="caption" sx={{ ml: 1, color: 'primary.main', fontWeight: 600 }}>
            Listening to your voice...
          </Typography>
        </Box>
      )}

      {/* Input Form Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={isListening ? 'Stop Voice Input' : 'Speak to Assistant'}>
            <IconButton
              color={isListening ? 'error' : 'primary'}
              onClick={toggleListening}
              sx={{
                bgcolor: isListening ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.08)',
                '&:hover': {
                  bgcolor: isListening ? 'rgba(239, 68, 68, 0.18)' : 'rgba(99, 102, 241, 0.15)',
                },
                width: 44,
                height: 44,
              }}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </IconButton>
          </Tooltip>

          <TextField
            fullWidth
            placeholder={isListening ? 'Speak your list now...' : 'Type message here...'}
            size="small"
            value={inputText}
            disabled={isListening}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputText.trim()) {
                handleUserInput(inputText);
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '9999px',
                px: 2,
              },
            }}
          />

          <IconButton
            color="primary"
            disabled={!inputText.trim()}
            onClick={() => handleUserInput(inputText)}
            sx={{
              bgcolor: inputText.trim() ? 'primary.main' : 'rgba(0,0,0,0.03)',
              color: inputText.trim() ? 'white' : 'text.disabled',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              width: 44,
              height: 44,
            }}
          >
            <Send size={18} />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
};

VoiceChatBox.propTypes = {
  user: PropTypes.object,
  currentItems: PropTypes.array,
  onAddItem: PropTypes.func,
  onSelectVendor: PropTypes.func,
  onTriggerCheckout: PropTypes.func,
  onAuthRedirect: PropTypes.func,
  onTypingSimulated: PropTypes.func,
};

export default VoiceChatBox;
