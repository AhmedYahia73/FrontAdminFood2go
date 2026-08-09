import React, { createContext, useContext, useRef, useEffect, useCallback, useState } from 'react';

const NotificationContext = createContext();

export const useNotificationSound = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationSound must be used within a NotificationListener');
    }
    return context;
};

const FALLBACK_URL = "/notificationsound.mp3";

const NotificationListener = ({ children, soundUrl }) => {
    const audioRef = useRef(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showEnableButton, setShowEnableButton] = useState(false);

    const hasPendingPlayRef = useRef(false);

    // Dynamic resolution of the sound to use
    const getActiveSound = useCallback(() => {
        return soundUrl || localStorage.getItem("notification_sound") || FALLBACK_URL;
    }, [soundUrl]);

    // The actual play function
    const playNotificationSound = useCallback(() => {
        const soundToUse = getActiveSound();
        console.log("🚀 Triggering sound play:", soundToUse);

        if (!audioRef.current) {
            audioRef.current = new Audio(soundToUse);
        } else if (audioRef.current.src !== soundToUse) {
            audioRef.current.src = soundToUse;
        }

        audioRef.current.play()
            .then(() => {
                hasPendingPlayRef.current = false;
                console.log("🔊 Sound played successfully");
            })
            .catch(err => {
                console.warn("❌ Auto-playback blocked. Queuing for interaction.", err.message);
                hasPendingPlayRef.current = true;
                setShowEnableButton(true);
            });
    }, [getActiveSound]);

    // Stealth Unlocker: Runs on ANY interaction
    const unlockAudio = useCallback(() => {
        if (isUnlocked) return;

        const soundToUse = getActiveSound();
        if (!audioRef.current) {
            audioRef.current = new Audio(soundToUse);
        }

        audioRef.current.play()
            .then(() => {
                setIsUnlocked(true);
                setShowEnableButton(false);
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                console.log("✅ Audio System Unlocked & Ready");

                // If a sound was missed, play it NOW
                if (hasPendingPlayRef.current) {
                    console.log("🎵 Playing queued notification sound...");
                    playNotificationSound();
                }

                cleanupListeners();
            })
            .catch(err => {
                console.warn("⚠️ Activation pending...", err.message);
            });
    }, [getActiveSound, playNotificationSound, isUnlocked]);

    const cleanupListeners = () => {
        window.removeEventListener("mousedown", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
    };

    useEffect(() => {
        // Aggressive listeners for ANY interaction
        window.addEventListener("mousedown", unlockAudio);
        window.addEventListener("keydown", unlockAudio);
        window.addEventListener("touchstart", unlockAudio);

        return cleanupListeners;
    }, [unlockAudio]);

    return (
        <NotificationContext.Provider value={{ playNotificationSound, isUnlocked }}>
            {children}
            {showEnableButton && (
                <button
                    onClick={unlockAudio}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 9999,
                        padding: '10px 20px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}
                >
                    Enable Notification Sound 🔊
                </button>
            )}
        </NotificationContext.Provider>
    );
};

export default NotificationListener;
