import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { getToken } from './authService';

class TopicSocketManager {
    constructor() {
        this.baseUrl = `${import.meta.env.VITE_BACKEND_API_BASE_URL}/ws`;
        this.client = null;
        this.connected = false;
        this.topics = new Map();
    }

    configure({ baseUrl } = {}) {
        if (baseUrl) this.baseUrl = baseUrl;
    }

    subscribe(topic, handlers = {}) {
        if (!this.client) this._connect();

        let entry = this.topics.get(topic);
        if (!entry) {
            entry = {
                refCount: 0,
                stompSubscription: null,
                listeners: new Map(),
            };
            this.topics.set(topic, entry);
            if (this.connected) this._subscribeTopic(topic);
        }

        entry.refCount += 1;

        Object.entries(handlers).forEach(([event, cb]) => {
            if (!entry.listeners.has(event)) entry.listeners.set(event, new Set());
            entry.listeners.get(event).add(cb);
        });

        return () => {
            Object.entries(handlers).forEach(([event, cb]) => {
                entry.listeners.get(event)?.delete(cb);
            });
            this._release(topic);
        };
    }

    _connect() {
        const token = getToken();
        if (!token) {
            console.error("WebSocket connection aborted: No auth token found.");
            return;
        }

        console.log(token)

        this.client = new Client({
            webSocketFactory: () => new SockJS(this.baseUrl),
            reconnectDelay: 3000,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },

            onConnect: () => {
                this.connected = true;
                // Re-subscribe to all tracked topics safely
                this.topics.forEach((_entry, topic) => this._subscribeTopic(topic));
            },

            onWebSocketClose: () => {
                this.connected = false;
                this.topics.forEach((entry) => {
                    entry.stompSubscription = null;
                });
                this._emitAll("close");
            },

            onStompError: (frame) => {
                const msg = frame.headers["message"] || "";
                const isAuthError = /administrators|unauthorized|forbidden|role/i.test(msg);

                if (isAuthError) {
                    console.error("Subscription blocked: You do not have permission for this topic.");
                    this.topics.forEach((_entry, topic) => console.log(topic))
                    this.client?.deactivate();
                    this.client = null;
                    this.connected = false;
                    return;
                }
            },
        });

        this.client.activate();
    }

    _subscribeTopic(topic) {
        const entry = this.topics.get(topic);
        if (!this.client || !this.connected || !entry) return;

        if (entry.stompSubscription) {
            entry.stompSubscription.unsubscribe();
            entry.stompSubscription = null;
        }

        entry.stompSubscription = this.client.subscribe(topic, (message) => {
            let data = message.body;
            try {
                data = JSON.parse(message.body);
            } catch {
            }

            this._emit(topic, "message", data);
            if (data?.type) this._emit(topic, data.type, data.payload ?? data);
        });
    }

    _release(topic) {
        const entry = this.topics.get(topic);
        if (!entry) return;

        entry.refCount -= 1;
        if (entry.refCount > 0) return;

        entry.stompSubscription?.unsubscribe();
        this.topics.delete(topic);

        if (this.topics.size === 0 && this.client) {
            this.client.deactivate();
            this.client = null;
            this.connected = false;
        }
    }

    _emit(topic, event, payload) {
        this.topics.get(topic)?.listeners.get(event)?.forEach((cb) => cb(payload));
    }

    _emitAll(event, payload) {
        this.topics.forEach((_entry, topic) => this._emit(topic, event, payload));
    }
}

export const topicSocketManager = new TopicSocketManager();
