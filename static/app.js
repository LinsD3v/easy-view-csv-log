async function loadInfo() {

    const status = document.getElementById("status")
    const uploadSection = document.getElementById("upload-section")
    const searchSection = document.getElementById("search-section")

    try {

        const response = await fetch("/csv/info")

        if (!response.ok) {
            throw new Error("Nenhum CSV")
        }

        const data = await response.json()

        status.innerHTML = `
            <p><strong>CSV carregado</strong></p>
            <p>Linhas: ${data.rows}</p>
            <p>Máquina: ${data.machine_type}</p>
            <p>Upload: ${data.uploaded_at}</p>
        `

        searchSection.style.display = "block"

    } catch {

        status.innerHTML = `
            <p>Nenhum CSV carregado</p>
        `

        uploadSection.style.display = "block"
    }
}

async function uploadCsv() {

    const fileInput = document.getElementById("csv-file")

    if (!fileInput.files.length) {
        alert("Selecione um arquivo")
        return
    }

    const formData = new FormData()

    formData.append(
        "file",
        fileInput.files[0]
    )

    const response = await fetch("/csv/upload", {
        method: "POST",
        body: formData
    })

    const data = await response.json()

    alert(data.message)

    location.reload()
}

async function searchProduct() {

    const query = document
        .getElementById("search-input")
        .value

    const response = await fetch(
        `/csv/search/product?query=${encodeURIComponent(query)}`
    )

    const data = await response.json()

    const resultsDiv = document.getElementById("results")

    resultsDiv.innerHTML = ""

    data.results.forEach(item => {

        resultsDiv.innerHTML += `
            <div class="card">
                <p>
                    <strong>${item.product_name}</strong>
                </p>

                <p>Base: ${item.base_code}</p>

                <p>Volume: ${item.volume}</p>

                <p>Data: ${item.date}</p>

                <p>Hora: ${item.time}</p>
            </div>
        `
    })
}

loadInfo()