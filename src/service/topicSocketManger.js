import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import {getToken } from './authService'

class TopicSocketManager {
    constructor() {
        this.baseUrl = "http://localhost:8080/ws";
        this.client = null;
        this.connected = false;
        this.topics = new Map();
        this.token = getToken();
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
    this.client = new Client({
        webSocketFactory: () => new SockJS(this.baseUrl),
        reconnectDelay: 3000,

        beforeConnect: () => {
            const token = getToken();
            if (!token) throw new Error("No token");
            this.client.connectHeaders = { Authorization: `Bearer ${token}` };
        },

        onConnect: () => {
            this.connected = true;
            this.topics.forEach((entry) => {
                entry.stompSubscription = null;
            });
            // Re-subscribe every tracked topic
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
            const isAuth = /bearer token|user token|Missing user role|administrators/i.test(msg);
            this.connected = false;
            if (isAuth && this.client) {
                this.client.deactivate();
                this.client = null;
            }
            this._emitAll("error", frame);
        },
    });

    this.client.activate();
}

    _subscribeTopic(topic) {
        const entry = this.topics.get(topic);
        if (!this.client || !entry || entry.stompSubscription) return;

        entry.stompSubscription = this.client.subscribe(topic, (message) => {
            let data = message.body;
            try {
                data = JSON.parse(message.body);
            } catch {
                // Keep non-JSON messages as raw strings.
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

        if (this.topics.size === 0) {
            this.client?.deactivate();
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
