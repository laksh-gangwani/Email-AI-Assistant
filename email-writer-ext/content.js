console.log("Email writer extension");

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
        return null;
    }
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
        return "";
    }
}

function injectButton() {
    const existingButton = document.querySelector('.ai-button');
    if (existingButton) {
        existingButton.remove();
    }
    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found")
        return;
    }
    console.log("Toolbar found");
    const button = createAIButton();
    button.classList.add('ai-button');
    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;
            const input = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent : input,
                    tone : "profesional and friendly", 
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const generatedReply = await response.text();
            // Find the box where you want to write the reply
            const replyBox = document.querySelector('[role="textbox"][g_editable="true"]');
            if (!replyBox) {
                console.log("Reply box not found");
                return;
            }
            replyBox.focus();
            document.execCommand('insertText', false, generatedReply);
        }
        catch (error) {
            console.error("Error generating AI reply:", error);
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node => {
            // First check if it's an Element node
            if (node.nodeType !== Node.ELEMENT_NODE) {
                return false;
            }
            
            // Then check if it matches the selectors directly
            if (node.matches && node.matches('.aDh, .btC, [role="dialog"]')) {
                return true;
            }
            
            // Or if it contains elements that match the selectors
            if (node.querySelector) {
                return node.querySelector('.aDh, .btC, [role="dialog"]') !== null;
            }
            
            return false;
        });

        if(hasComposeElements) {
            console.log("Compose elements detected");
            setTimeout(injectButton, 500);
        }
    }
})

observer.observe(document.body, { childList: true, subtree: true });