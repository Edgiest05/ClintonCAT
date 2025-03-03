import { IMainMessage, Main } from './main';

const main = new Main();

chrome.runtime.onInstalled.addListener(() => {
    main.onBrowserExtensionInstalled();
});

chrome.runtime.onMessage.addListener(
    (message: IMainMessage, sender: chrome.runtime.MessageSender, sendResponse: VoidFunction) => {
        main.onBrowserExtensionMessage(message, sender, sendResponse);
    }
);

export interface IToastMessage {
    text: string;
}

export function onBrowserExtensionMessage(
    _message: IToastMessage,
    _sender: chrome.runtime.MessageSender,
    _sendResponse: VoidFunction
): void {
    // toast(message.text);
}

chrome.runtime.onMessage.addListener(
    (message: IToastMessage, sender: chrome.runtime.MessageSender, sendResponse: VoidFunction) => {
        onBrowserExtensionMessage(message, sender, sendResponse);
    }
);
