function createCard(id, text, createdAt) {
    const card = document.createElement("div");
    card.className = "card";
    card.id = id;

    const span = document.createElement("span");
    span.textContent = text;

    // Editar ao dar duplo clique
    span.ondblclick = () => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = span.textContent;
        input.className = "edit-input";
        card.replaceChild(input, span);
        input.focus();

        input.onblur = () => {
            if (input.value.trim() !== "") {
                span.textContent = input.value.trim();
            }
            card.replaceChild(span, input);
            saveState();
        };

        input.onkeydown = (e) => {
            if (e.key === "Enter") {
                input.blur();
            } else if (e.key === "Escape") {
                card.replaceChild(span, input);
            }
        };
    };

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.innerHTML = "🗑️";
    del.onclick = () => {
        card.remove();
        saveState();
    };

    const date = document.createElement("small");
    date.className = "card-date";

    let dateText;
    if (createdAt) {
        const dateObj = new Date(createdAt);
        dateText = dateObj.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } else {
        const now = new Date();
        createdAt = now.toISOString();
        dateText = now.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    date.textContent = `Criado em: ${dateText}`;

    card.appendChild(span);
    card.appendChild(del);
    card.appendChild(date);
    return card;
}

let currentList = null;

function openAddCardModal(listElement) {
    currentList = listElement;
    const modal = document.getElementById("modal");
    const input = document.getElementById("cardText");
    const confirmBtn = document.getElementById("confirmAddCard");

    input.value = "";
    modal.style.display = "flex";
    input.focus();

    confirmBtn.onclick = () => {
        const text = input.value.trim();
        if (!text || !currentList) return;

        const id = `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const card = createCard(id, text);
        const addBtn = currentList.querySelector(".add-btn");
        currentList.insertBefore(card, addBtn);
        saveState();
        modal.style.display = "none";
        currentList = null;
    };
}


function closeModal() {
    document.getElementById("modal").style.display = "none";
}

function saveState() {
    const state = {};
    document.querySelectorAll(".list").forEach((list) => {
        const listId = list.dataset.listId;
        const cards = Array.from(list.querySelectorAll(".card")).map((card) => ({
            id: card.id,
            text: card.querySelector("span").textContent,
            createdAt: card.querySelector(".card-date")?.dataset?.timestamp || new Date().toISOString()
        }));
        state[listId] = cards;
    });
    localStorage.setItem("trelloState", JSON.stringify(state));
}

function loadState() {
    const state = JSON.parse(localStorage.getItem("trelloState"));
    if (!state) return;

    Object.entries(state).forEach(([listId, cards]) => {
        const list = document.querySelector(`.list[data-list-id="${listId}"]`);
        const addBtn = list.querySelector(".add-btn");
        cards.forEach((cardData) => {
            const card = createCard(cardData.id, cardData.text, cardData.createdAt);
            list.insertBefore(card, addBtn);
        });
    });

    createSortable();
}

function createSortable() {
    document.querySelectorAll(".list").forEach((list) => {
        new Sortable(list, {
            group: "shared",
            animation: 150,
            ghostClass: "ghost",
            draggable: ".card",
            onEnd: saveState,
        });
    });
}

function applyTheme() {
    const theme = localStorage.getItem("theme");
    const toggleBtn = document.getElementById("toggleTheme");
    if (theme === "dark") {
        document.body.classList.add("dark");
        toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove("dark");
        toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

document.getElementById("toggleTheme").addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    applyTheme();
});

window.addEventListener("load", () => {
    loadState();
    applyTheme();
    document.getElementById("cancelAddCard").addEventListener("click", closeModal);
});
