// Elementos DOM
const statusBadge = document.getElementById("status-badge");
const uploadSection = document.getElementById("upload-section");
const infosSection = document.getElementById("info-section");
const searchSection = document.getElementById("search-section");
const clearSection = document.getElementById("clear-section");
const uploadBox = document.getElementById("upload-box");
const csvFileInput = document.getElementById("csv-file");
let isUploading = false;

function updateStatusBadge(html, type = "") {
    statusBadge.classList.remove("loading", "error", "success");
    if (type) {
        statusBadge.classList.add(type);
    }
    statusBadge.innerHTML = html;
}

function setNoCsvStatus() {
    updateStatusBadge(`
        <p class="status-loading">📁 <strong>Nenhum CSV carregado</strong></p>
        <p>Envie um arquivo CSV para começar.</p>
    `);
}

function setUploadingStatus(file) {
    updateStatusBadge(`
        <p class="status-loading">⏳ Enviando arquivo <strong>${file.name}</strong>...</p>
        <p>Tamanho: <strong>${(file.size / 1024).toFixed(1)} KB</strong></p>
        <p>Aguarde enquanto o servidor processa o CSV.</p>
    `, "loading");
}

function setErrorStatus(message) {
    updateStatusBadge(`
        <p class="status-loading">❌ Erro no upload</p>
        <p>${message}</p>
    `, "error");
}

function setSuccessStatus(message) {
    updateStatusBadge(`
        <p class="status-loaded">✅ ${message}</p>
    `, "success");
}

// Drag and Drop
uploadBox.addEventListener("click", () => csvFileInput.click());
uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = "#764ba2";
    uploadBox.style.background = "#e8e8ff";
});
uploadBox.addEventListener("dragleave", () => {
    uploadBox.style.borderColor = "#667eea";
    uploadBox.style.background = "#f8f9ff";
});
uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = "#667eea";
    uploadBox.style.background = "#f8f9ff";
    
    if (e.dataTransfer.files.length) {
        const file = e.dataTransfer.files[0];
        const dt = new DataTransfer();
        dt.items.add(file);
        csvFileInput.files = dt.files;
    }
});

csvFileInput.addEventListener("change", () => {
    const selectedFile = csvFileInput.files[0];
    if (selectedFile) {
        uploadBox.querySelector("p").textContent = `Arquivo selecionado: ${selectedFile.name}`;
    }
});

async function loadInfo() {
    try {
        const response = await fetch("/csv/info");

        if (!response.ok) {
            throw new Error("Nenhum CSV");
        }

        const data = await response.json();

        // Formatar data
        const uploadDate = new Date(data.uploaded_at);
        const formattedDate = uploadDate.toLocaleString("pt-BR");

        // Formatar período
        let periodText = "-";
        if (data.first_record && data.first_record.mixed_at && data.second_record && data.second_record.mixed_at) {
            const firstDate = new Date(data.first_record.mixed_at);
            const lastDate = new Date(data.log_period.end);
            
            const formattedFirstDate = firstDate.toLocaleDateString("pt-BR");
            const formattedLastDate = lastDate.toLocaleDateString("pt-BR");
            
            periodText = `${formattedFirstDate} até ${formattedLastDate}`;
        }

        // Atualizar informações
        document.getElementById("info-rows").textContent = data.rows.toLocaleString("pt-BR");
        document.getElementById("info-machine").textContent = data.machine_type || "Desconhecida";
        document.getElementById("info-time").textContent = formattedDate;
        document.getElementById("info-columns").textContent = data.columns.length;
        document.getElementById("info-period").textContent = periodText;

        // Mostrar seções apropriadas
        uploadSection.style.display = "none";
        infosSection.style.display = "block";
        searchSection.style.display = "block";
        clearSection.style.display = "block";

        // Status
        statusBadge.innerHTML = `
            <p class="status-loaded">✅ <strong>CSV Carregado com Sucesso!</strong></p>
            <p>📊 Total de registros: <strong>${data.rows.toLocaleString("pt-BR")}</strong></p>
            <p>🏭 Máquina: <strong>${data.machine_type}</strong></p>
            <p>📋 Colunas: <strong>${data.columns.length}</strong> (${data.columns.join(", ")})</p>
            <p>⏰ Carregado em: <strong>${formattedDate}</strong></p>
            <p>📅 Período: <strong>${periodText}</strong></p>
            <p>🔍 Primeiro registro: <strong>${data.first_record?.product_name}</strong> às <strong>${new Date(data.first_record?.mixed_at).toLocaleTimeString("pt-BR")}</strong></p>
            <p>🔍 Segundo registro: <strong>${data.second_record?.product_name}</strong> às <strong>${new Date(data.second_record?.mixed_at).toLocaleTimeString("pt-BR")}</strong></p>
        `;

    } catch {
        uploadSection.style.display = "block";
        infosSection.style.display = "none";
        searchSection.style.display = "none";
        clearSection.style.display = "none";

        statusBadge.innerHTML = `
            <p class="status-loading">📁 <strong>Nenhum CSV carregado</strong></p>
            <p>Envie um arquivo CSV p=ara começar</p>
        `;
    }
}

async function uploadCsv() {
    if (isUploading) {
        return;
    }

    const fileInput = document.getElementById("csv-file");

    if (!fileInput.files.length) {
        alert("❌ Selecione um arquivo antes de fazer o upload");
        return;
    }

    const file = fileInput.files[0];
    
    // Validar extensão
    if (!file.name.endsWith(".csv")) {
        alert("❌ Por favor, selecione um arquivo CSV");
        return;
    }

    isUploading = true;
    setUploadingStatus(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("/csv/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            setErrorStatus(data.error || data.message || "Falha ao enviar o arquivo.");
            isUploading = false;
            return;
        }

        setSuccessStatus("CSV enviado com sucesso! Recarregando informações...");

        setTimeout(() => {
            loadInfo();
            isUploading = false;
        }, 500);

    } catch (error) {
        setErrorStatus(`Erro ao enviar arquivo: ${error.message}`);
        isUploading = false;
    }
}

async function searchProduct() {
    const query = document.getElementById("search-input").value.trim();

    if (!query) {
        alert("❌ Digite o nome do produto para buscar");
        return;
    }

    try {
        const response = await fetch(
            `/csv/search/product?query=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        if (!response.ok) {
            alert(`❌ Erro: ${data.error}`);
            return;
        }

        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "";

        if (data.results.length === 0) {
            resultsDiv.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #999;">
                    <p>🔍 Nenhum produto encontrado com o termo "<strong>${query}</strong>"</p>
                </div>
            `;
            return;
        }

        resultsDiv.innerHTML = `
            <div style="text-align: center; color: #667eea; margin-bottom: 20px;">
                <strong>✅ ${data.results.length} resultado(s) encontrado(s)</strong>
            </div>
        `;

        data.results.forEach(item => {
            resultsDiv.innerHTML += `
                <div class="card">
                    <p><strong>📦 ${item.product_name}</strong></p>
                    <p>🔑 Código: <span style="color: #667eea;">${item.base_code}</span></p>
                    <p>🎨 Cor dosada: <span style="color: #667eea;">${item.cor  || item.color || item.color_code || "-"}</span></p>
                    <p>📊 Volume: <span style="color: #667eea;">${item.volume}</span></p>
                    <p>📅 Data: <span style="color: #667eea;">${item.date}</span></p>
                    <p>⏱️ Hora: <span style="color: #667eea;">${item.time}</span></p>
                </div>
            `;
        });

    } catch (error) {
        alert(`❌ Erro ao buscar: ${error.message}`);
    }
}

async function clearData() {
    if (confirm("⚠️ Tem certeza que deseja limpar os dados? Esta ação não pode ser desfeita.")) {
        try {
            const response = await fetch("/csv/clear", {
                method: "POST"
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorStatus(data.error || data.message || "Falha ao limpar os dados.");
                return;
            }

            setSuccessStatus("Dados limpos com sucesso! Recarregando...");

            setTimeout(() => {
                loadInfo();
            }, 500);

        } catch (error) {
            setErrorStatus(`Erro ao limpar dados: ${error.message}`);
        }
    }
}

// Permitir busca com Enter
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                searchProduct();
            }
        });
    }
});

// Busca Avançada
function openAdvancedSearch() {
    document.getElementById("advanced-search-modal").style.display = "flex";
}

function closeAdvancedSearch() {
    document.getElementById("advanced-search-modal").style.display = "none";
    // Limpar campos
    document.getElementById("adv-query").value = "";
    document.getElementById("adv-base").value = "";
    document.getElementById("adv-volume").value = "";
    document.getElementById("adv-color").value = "";
}

async function advancedSearch() {
    const query = document.getElementById("adv-query").value.trim();
    const base = document.getElementById("adv-base").value.trim();
    const volume = document.getElementById("adv-volume").value.trim();
    const color = document.getElementById("adv-color").value.trim();

    // Verificar se pelo menos um campo foi preenchido
    if (!query && !base && !volume && !color) {
        alert("❌ Preencha pelo menos um campo para buscar");
        return;
    }

    // Construir URL com parâmetros
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (base) params.append("base", base);
    if (volume) params.append("volume", volume);
    if (color) params.append("color", color);

    try {
        const response = await fetch(`/csv/search/product?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
            alert(`❌ Erro: ${data.error}`);
            return;
        }

        // Fechar modal
        closeAdvancedSearch();

        // Limpar busca simples
        document.getElementById("search-input").value = "";

        // Mostrar resultados
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "";

        if (data.results.length === 0) {
            resultsDiv.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #999;">
                    <p>🔍 Nenhum produto encontrado com os filtros aplicados</p>
                </div>
            `;
            return;
        }

        resultsDiv.innerHTML = `
            <div style="text-align: center; color: #667eea; margin-bottom: 20px;">
                <strong>✅ ${data.results.length} resultado(s) encontrado(s)</strong>
            </div>
        `;

        data.results.forEach(item => {
            resultsDiv.innerHTML += `
                <div class="card">
                    <p><strong>📦 ${item.product_name}</strong></p>
                    <p>🔑 Base: <span style="color: #667eea;">${item.base_code}</span></p>
                    <p>🎨 Cor dosada: <span style="color: #667eea;">${item.cor || item.color_code || "-"}</span></p>
                    <p>📊 Volume: <span style="color: #667eea;">${item.volume}</span></p>
                    <p>📅 Data: <span style="color: #667eea;">${item.date}</span></p>
                    <p>⏱️ Hora: <span style="color: #667eea;">${item.time}</span></p>
                </div>
            `;
        });

    } catch (error) {
        alert(`❌ Erro ao buscar: ${error.message}`);
    }
}

// Fechar modal ao clicar fora
document.addEventListener("click", (e) => {
    const modal = document.getElementById("advanced-search-modal");
    if (e.target === modal) {
        closeAdvancedSearch();
    }
});

// Carregar informações ao iniciar
loadInfo();