# Analisador de Logs Tintométricos

[![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1+-darkred?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Pandas](https://img.shields.io/badge/Pandas-2.3+-navy?logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Um sistema web de análise operacional de logs tintométricos projetado para dosadoras de tinta. Transforma exports CSV brutos em datasets normalizados e pesquisáveis, reduzindo tempo de investigação manual e acelerando investigações operacionais em lojas de tintas.

---

## 🎯 Propósito

Este não é um simples leitor de CSV. É um **sistema orientado por domínio** para análise operacional de máquinas tintométricas que recebem exportações de registros e os normalizam em uma estrutura padrão, pesquisável e consistente.

### Problema Operacional

Lojas de tintas precisam investigar frequentemente operações de dosagem de máquinas tintométricas:

- ❌ Qual produto foi dosado?
- ❌ Qual base foi utilizada?
- ❌ Qual volume foi selecionado?
- ❌ Quando ocorreu a dosagem?
- ❌ Qual código de cor foi gerado?

**Tradicionialmente**, funcionários:
- Abriam planilhas manualmente
- Inspecionavam CSVs brutos inconsistentes
- Copiavam/colavam dados entre formatos
- Perdiam tempo em buscas lineares

### Solução

O **Analisador de Logs Tintométricos** centraliza toda investigação em uma interface web operacional:

✅ **Upload direto do navegador** — sem instalação de software  
✅ **Busca em tempo real** — sobre datasets normalizados  
✅ **Filtros avançados** — por produto, base, volume, período  
✅ **Padronização automática** — removendo inconsistências  
✅ **API REST** — para integrações futuras  

---

## 🏗️ Arquitetura Orientada por Domínio

O sistema segue princípios de **Domain-Driven Design (DDD)**, separando formatos brutos de máquina da lógica de negócio através de **adapters** especializados.

```
Arquivo CSV Bruto
       ↓
  [Adapter Específico]  ← M. Verginia, Coral, Suvinil
       ↓
DataFrame Padronizado
       ↓
  [Motor de Busca]
       ↓
REST API
       ↓
Interface Web Operacional
```

### Fluxo de Normalização

1. **CSV Bruto** → Cada máquina exporta formatos completamente diferentes
2. **Machine Adapter** → Transforma colunas específicas em schema padrão
3. **Standardized DataFrame** → Estrutura interna unificada (machine_code, mixed_at, base_code, product_name, volume, color_code)
4. **Search Engine** → Filtros otimizados com Pandas
5. **REST API** → Endpoints para upload, busca, limpeza
6. **Web Interface** → UI leve e operacional para investigações rápidas

### Benefícios da Arquitetura

| Aspecto | Benefício |
|---------|-----------|
| **Escalabilidade** | Novos adapters sem modificar core |
| **Manutenibilidade** | Lógica de parsing isolada por máquina |
| **Consistência** | Todos os dados segem schema único |
| **Extensibilidade** | Pronto para múltiplas máquinas |

---

## 🛠️ Stack Tecnológico

| Componente | Tecnologia | Função |
|-----------|-----------|---------|
| **Backend** | Python + Flask | REST API e orquestração |
| **Processamento** | Pandas | Motor analítico em memória |
| **Frontend** | HTML5 + CSS3 + JavaScript | Interface operacional |
| **Serialização** | JSON | Comunicação API |
| **Deployment** | Render | Hospedagem cloud |

### Por que Pandas?

Pandas funciona como **motor analítico em memória** para:
- ✅ Filtros de dados extremamente rápidos
- ✅ Operações de coluna otimizadas
- ✅ Conversão de tipos segura
- ✅ Aggregações e transformações complexas

---

## ✨ Funcionalidades

### Operacionais

- **📁 Upload via Navegador** — Drag-and-drop ou seleção tradicional
- **🔄 Processamento em Memória** — Sem persistência de arquivo
- **⚡ Motor de Busca Rápido** — Filtros otimizados com Pandas
- **🔍 Busca por Produto** — Partial matching com case-insensitive
- **🏭 Filtro por Base** — Código de base com wildcards
- **📏 Filtro por Volume** — Seleção exata de volumes
- **🎨 Filtro por Cor** — Código de cor com wildcard
- **📊 Detecção de Período** — Extração automática de data inicial/final
- **🚀 Ordenação por Recência** — Registros mais novos primeiro
- **💾 Limpeza Sem Restart** — Reset de dataset sem reiniciar servidor

### Limpeza de Dados

O sistema realiza **normalização operacional** automática:

```python
✓ Remove produtos inválidos
✓ Descarta registros sem código de produto
✓ Filtra unidades não-válidas (apenas L e KG)
✓ Normaliza espaçamento e BOM UTF-8
✓ Converte timestamps para datetime
✓ Valida volumes numéricos
✓ Remove logs de teste inconsistentes
✓ Padroniza códigos de base e cor
```

**Design: Baseado em dados reais e inconsistentes** de máquinas tintométricas.

---

## 🚀 Início Rápido

### Pré-requisitos

- Python 3.9+
- pip ou ambiente virtual

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/tintometric-analyzer.git
cd tintometric-analyzer

# Crie ambiente virtual (recomendado)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instale dependências
pip install -r requirements.txt
```

### Execução Local

```bash
# Inicie o servidor Flask
python app.py

# Acesse em seu navegador
# http://localhost:5000
```

### Deployment (Render)

```bash
# O app está configurado para rodar com Gunicorn
# Variáveis de ambiente: FLASK_ENV=production
```

---

## 📡 API REST

### `GET /live`
Healthcheck do servidor.

**Response:**
```json
{
  "message": "Servidor online"
}
```

---

### `POST /csv/upload`
Faz upload de arquivo CSV e o processa com adapter apropriado.

**Request:**
```bash
curl -X POST -F "file=@export.csv" http://localhost:5000/csv/upload
```

**Response (Sucesso):**
```json
{
  "message": "CSV carregado com sucesso",
  "rows": 4532,
  "columns": ["machine_code", "mixed_at", "base_code", "product_name", "volume", "color_code", "date", "time"],
  "uploaded_at": "2026-05-24T14:32:15.432100",
  "log_period": {
    "start": "2026-05-20T08:15:00",
    "end": "2026-05-24T18:45:30"
  }
}
```

---

### `GET /csv/info`
Retorna metadados sobre dataset carregado.

**Response:**
```json
{
  "rows": 4532,
  "columns": ["machine_code", "mixed_at", "base_code", "product_name", "volume", "color_code", "date", "time"],
  "machine_type": "m_verginia",
  "uploaded_at": "2026-05-24T14:32:15.432100",
  "log_period": {
    "start": "2026-05-20T08:15:00",
    "end": "2026-05-24T18:45:30"
  },
  "first_record": {
    "machine_code": "VM001",
    "mixed_at": "2026-05-20T08:15:00",
    "product_name": "SUVINIL ACRÍLICO",
    "base_code": "BC",
    "volume": 18.0,
    "color_code": "CF-2847",
    "date": "2026-05-20",
    "time": "08:15:00"
  },
  "second_record": {...}
}
```

---

### `GET /csv/search/product`
Busca avançada com múltiplos filtros.

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Exemplo |
|-----------|------|----------|---------|
| `query` | string | ✗ | `query=Acrílico` |
| `base` | string | ✗ | `base=BC` |
| `volume` | float | ✗ | `volume=18.0` |
| `color` | string | ✗ | `color=CF-2847` |

**Exemplo Completo:**
```bash
GET /csv/search/product?query=suvinil&base=BC&volume=18.0
```

**Response:**
```json
{
  "count": 23,
  "results": [
    {
      "machine_code": "VM001",
      "mixed_at": "2026-05-24T15:32:10",
      "base_code": "BC",
      "product_name": "SUVINIL ACRÍLICO",
      "volume": 18.0,
      "color_code": "CF-2847",
      "date": "2026-05-24",
      "time": "15:32:10"
    },
    ...
  ]
}
```

**Notas:**
- Retorna máximo 50 registros
- Ordena por `mixed_at` descendente (mais recentes primeiro)
- Pelo menos um parâmetro de busca deve ser fornecido
- Matching é case-insensitive para query
- Volume requer match exato

---

### `POST /csv/clear`
Remove dataset carregado (sem reiniciar servidor).

**Response:**
```json
{
  "message": "CSV removido com sucesso"
}
```

---

## 🖥️ Interface Web

A interface foi projetada para **ambientes operacionais**:

- **Leve** — Sem dependências de frameworks pesados
- **Responsiva** — Funciona em tablets e smartphones
- **Rápida** — Feedback instantâneo em buscas
- **Intuitiva** — Projetada para lojas de tintas
- **Drag-and-drop** — Upload direto sem cliques múltiplos

### Fluxo de Uso

1. **Upload** → Arraste CSV ou clique para selecionar
2. **Visualizar Metadados** → Período, linhas, máquina
3. **Buscar** → Digite produto ou aplique filtros avançados
4. **Investigar** → Veja últimos 50 registros ordenados por recência
5. **Limpar** → Reset para novo upload sem reiniciar servidor

---

## 🔮 Futuro Arquitetônico

O sistema foi **intencionalmente projetado** para escalação multi-máquina:

### Máquinas Suportadas (Planned)

- ✅ **M. Verginia** — Adapter implementado
- 🚧 **Coral** — Adapter em desenvolvimento
- 🚧 **Suvinil** — Adapter planejado
- 🚧 Novos adapters facilmente adicionáveis

### Análise Unificada

```python
# Concatenar datasets de múltiplas máquinas
df_verginia = parse_m_verginia(csv_verginia)
df_coral = parse_coral(csv_coral)
df_suvinil = parse_suvinil(csv_suvinil)

unified_df = pd.concat([df_verginia, df_coral, df_suvinil])

# Machine identification automática
unified_df['machine_id'] = df['machine_code'].apply(identify_machine)
```

### Roadmap

| Fase | Funcionalidade | Status |
|------|-----------------|--------|
| **V1** | Parser M. Verginia | ✅ |
| **V2** | Múltiplos adapters | 🚧 |
| **V3** | Dashboards analíticos | 🔮 |
| **V4** | Motor de detecção de inconsistências | 🔮 |
| **V5** | Alertas em tempo real | 🔮 |

---

## 📁 Estrutura do Projeto

```
.
├── app.py                          # Aplicação Flask principal
├── state.py                        # Estado em memória (thread-safe)
├── requirements.txt                # Dependências Python
├── adapters/
│   └── m_verginia.py              # Parser para M. Verginia
├── static/
│   ├── app.js                     # Lógica frontend (upload, busca)
│   └── style.css                  # Estilização operacional
├── templates/
│   └── index.html                 # Interface HTML
├── data/
│   ├── mock.csv                   # CSV de teste
│   └── history.csv                # Histórico (opcional)
├── README.md                       # Esta documentação
└── LICENSE                         # MIT License
```

---

## 🔧 Desenvolvimento

### Adicionar Novo Adapter

1. Crie novo arquivo em `adapters/m_novaEmpresa.py`
2. Implemente função `parse_m_novaEmpresa(df: pd.DataFrame) -> pd.DataFrame`
3. Retorne DataFrame com schema padrão:
   ```python
   {
       "machine_code": str,
       "mixed_at": datetime,
       "base_code": str,
       "product_name": str,
       "volume": float,
       "color_code": str,
       "date": str (YYYY-MM-DD),
       "time": str (HH:MM:SS)
   }
   ```
4. Integre em `app.py` no endpoint `/csv/upload`

### Exemplo de Adapter

```python
def parse_m_novaempresa(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    
    # Normalizar colunas
    df.columns = [c.strip() for c in df.columns]
    
    # Criar schema padrão
    parsed = pd.DataFrame({
        "machine_code": df["MachineID"],
        "mixed_at": pd.to_datetime(df["MixTime"], errors="coerce"),
        "base_code": df["BaseCode"],
        "product_name": df["Product"],
        "volume": pd.to_numeric(df["Vol"], errors="coerce"),
        "color_code": df["ColorID"]
    })
    
    parsed["date"] = parsed["mixed_at"].dt.strftime("%Y-%m-%d")
    parsed["time"] = parsed["mixed_at"].dt.strftime("%H:%M:%S")
    
    return parsed
```

---

## 📊 Exemplo de Uso Real

### Investigação: "Dosagens de Suvinil BC nos últimos 3 dias"

**Antes (sem sistema):**
```
1. Abrir Excel
2. Ctrl+F "Suvinil"
3. Verificar manualmente cada base
4. Copiar datas relevantes
5. Tempo: ~15 minutos
```

**Com o Sistema:**
```bash
curl "http://localhost:5000/csv/search/product?query=suvinil&base=BC"
```

**Resultado:**
```
23 registros encontrados
Mais recente: 2026-05-24 15:32:10
Mais antigo: 2026-05-20 08:15:00
Tempo: ~0.5 segundos
```

---

## 🎓 Conceitos de Engenharia

Este projeto demonstra:

- ✅ **Domain-Driven Design** — Lógica orientada por domínio
- ✅ **Adapter Pattern** — Isolamento de parsers específicos
- ✅ **In-Memory Analytics** — Pandas como motor de query
- ✅ **REST API Design** — Endpoints convencionais e idempotentes
- ✅ **Separation of Concerns** — Frontend, API, business logic desacoplados
- ✅ **Data Normalization** — Transformação de formatos heterogêneos
- ✅ **Operational UX** — Interface focada em produtividade

---

## 📝 Licença

MIT License — Veja [LICENSE](LICENSE) para detalhes.

---

## 🤝 Sobre

Um projeto de engenharia backend focado em **resolver problemas operacionais reais** em lojas de tintas através de normalização de dados e busca rápida.

**Não é um projeto tutorial.** É um sistema real projetado para reduzir tempo de investigação manual e centralizar análise de logs tintométricos em um único interface operacional.

---

**Desenvolvido com foco em**: Engenharia Backend | Domain-Driven Design | Operações Industriais
