javascript// Game State Machine
const player = {
    depth: 1,
    phase: "Descent",
    perspective: 1,
    recall: 1,
    hasPivot: false
};

let typingTimer = null;

// Database of Room Nodes
const maze = {
    1: {
        text: "Depth 1: The Void of First Assumptions. You stand on a plain of pure white light. Three distinct structures frame the path ahead. There are no signs, only the shapes of your intentions.",
        choices: [
            { text: "Enter the obsidian archway.", target: 2, bonus: { type: 'recall', val: 1 } },
            { text: "Step directly into the column of liquid mercury.", target: 'pivot_room', bonus: null },
            { text: "Pass through the blank gap between them.", target: 2, bonus: { type: 'perspective', val: 1 } }
        ]
    },
    'pivot_room': {
        text: "Depth 2 (Shifted): The uncertainty wraps around you. Instead of failing or resetting, your focus sharpens to look for fundamental patterns. You have lost nothing. You have simply adapted.",
        concepts: "The Observer's Pivot (Failure alters coordinates).",
        choices: [
            { text: "Integrate this truth and continue downward.", target: 2, bonus: { type: 'pivot', val: true } }
        ]
    },
    2: {
        text: "Depth 2: The Hall of Fractured Mirrors. The walls reflect your past choices. A faint inscription reads: 'The version of you that stumbled taught the version of you standing here.'",
        choices: [
            { text: "Examine your largest reflection.", target: 3, bonus: { type: 'recall', val: 1 } },
            { text: "Step through the rhythm of the unpolished glass.", target: 3, bonus: { type: 'perspective', val: 1 } }
        ]
    },
    3: {
        text: "Depth 3: The Library of Unwritten Laws. Slips of drifting paper hold rules given to you by society or your own anxieties. One reads: 'You must always know the outcome before you try.'",
        choices: [
            { text: "Sit and study the syntax of the papers.", target: 4, bonus: { type: 'recall', val: 1 } },
            { text: "Push directly through a solid wooden bookshelf.", target: 4, bonus: { type: 'perspective', val: 1 } }
        ]
    },
    4: {
        text: "Depth 4: The Monolith of Weightless Matter. Transitioning deeper, the scenery thickens. You stand before a massive boulder suspended over an infinite starless abyss. It bars the path entirely, pulsing with the dense gravity of primal material anxiety. It is too heavy for human muscle, yet it hangs unanchored. To pass, you must interact with something that refuses to acknowledge your physical constraints.",
        choices: [
            { text: "Lean your weight into the stone.", target: 5, bonus: { type: 'recall', val: 1 } },
            { text: "Float upward, attempting to phase through it.", target: 'trap_room', bonus: null }
        ]
    },
    'trap_room': {
        text: "The stone rejects your phasing. It feels cold against your skin, guiding your hands safely to crevices. The friction doesn't crush you; it shifts your footing. You climb. As you sit upon the summit of the mass that blocked you, you see that the stone is now beneath you—weightless, discarded, and serving as your vessel.",
        choices: [
            { text: "Acknowledge that your friction became your path.", target: 5, bonus: { type: 'perspective', val: 2 } }
        ]
    },
    5: {
        text: "Depth 5: The Threshold of the Engine. You have reached the core mechanism of the system. The white light is blinding now, stripping away your attachment to coordinates, numbers, and individual progress. The walls collapse. To step into true reality, you must carry this light backwards into the world of structures.",
        choices: [
            { text: "Touch the center and accept your Ascent.", target: 6, phaseChange: "Ascent" }
        ]
    },
    6: {
        text: "Ascending... You trace your steps out, but the corridor morphs into a flashing, chaotic gambling engine. Neon screens offer minor numbers and endless, safe validation loops designed to capture your attention.",
        getDynamicChoices: function() {
            let options = [];
            options.push({ text: "Engage with the blinking loops.", target: 'loop_trap' });
            if (player.hasPivot) {
                options.push({ text: "Utilize your insight to pivot parameters.", target: 7 });
            } else {
                options.push({ text: "Search for an alternative output path.", target: 7 });
            }
            return options;
        }
    },
    'loop_trap': {
        text: "The loop captures your attention. In an ordinary system, this is an addictive trap. Here, experiencing the loop firsthand provides clean spatial data. You map it.",
        choices: [
            { text: "Use the new data to bypass the machine.", target: 7, bonus: { type: 'perspective', val: 1 } }
        ]
    },
    7: {
        text: "The final boundary. You stand at the exit, looking out at everyday life. An inscription asks: 'You return to a world that lives in fear of loss. How will you show them this maze?'",
        choices: [
            { text: "By constructing a hidden loop of choices to play.", target: 1, reset: true },
            { text: "By living without attachments as a statement.", target: 1, reset: true }
        ]
    }
};

// Typewriter text engine
function typeWriter(text, elementId, speed, callback) {
    let i = 0;
    const element = document.getElementById(elementId);
    element.textContent = "";
    clearInterval(typingTimer);
    typingTimer = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typingTimer);
            if (callback) callback();
        }
    }, speed);
}

// Master Render System
function renderGame() {
    const currentRoom = maze[player.depth];
    
    document.getElementById("depth-val").textContent = 
        typeof player.depth === 'number' ? player.depth : "Transition";
    document.getElementById("phase-val").textContent = player.phase;
    document.getElementById("stat-p").textContent = player.perspective;
    document.getElementById("stat-r").textContent = player.recall;

    const choicesContainer = document.getElementById("choices");
    choicesContainer.innerHTML = "";

    const conceptsBox = document.getElementById("concepts-box");
    const conceptText = document.getElementById("concept-text");

    if (player.hasPivot) {
        conceptsBox.classList.remove("hidden");
        conceptText.textContent = "The Observer's Pivot (Active)";
    } else {
        conceptsBox.classList.add("hidden");
    }

    typeWriter(currentRoom.text, "story", 12, () => {
        if (currentRoom.concepts) {
            conceptsBox.classList.remove("hidden");
            conceptText.textContent = currentRoom.concepts;
        }

        const rawChoices = currentRoom.getDynamicChoices 
            ? currentRoom.getDynamicChoices() 
            : currentRoom.choices;

        rawChoices.forEach(choice => {
            const btn = document.createElement("button");
            btn.className = "choice-btn";
            btn.textContent = choice.text;
            
            btn.addEventListener("click", () => {
                if (choice.bonus) {
                    if (choice.bonus.type === 'perspective') player.perspective += choice.bonus.val;
                    if (choice.bonus.type === 'recall') player.recall += choice.bonus.val;
                    if (choice.bonus.type === 'pivot') player.hasPivot = true;
                }
                if (choice.phaseChange) player.phase = choice.phaseChange;
                
                if (choice.reset) {
                    player.depth = 1;
                    player.phase = "Descent";
                    player.perspective = 1;
                    player.recall = 1;
                    player.hasPivot = false;
                } else {
                    player.depth = choice.target;
                }
                renderGame();
            });
            choicesContainer.appendChild(btn);
        });
    });
}

// Start Engine
renderGame();
