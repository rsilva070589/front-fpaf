<template>
  <div class="drop-area" 
       @dragover.prevent="dragOver = true" 
       @dragleave="dragOver = false" 
       @drop="handleDrop" 
       :class="{ 'dragging': dragOver }">
    Arraste e solte arquivos aqui ou
    <input type="file" multiple @change="handleFileSelect" />
  </div>

  <form @submit.prevent="uploadFiles">
    <input v-model="formData.nome" placeholder="Nome" required />
    <input v-model="formData.codProva" placeholder="Código da Prova" required />
    <input v-model="formData.tipo" placeholder="Tipo" required />

    <div class="periodo-container">
      <div>
        <label>Período Início</label>
        <input v-model="formData.periodoInicio" type="date" required />
      </div>
      <div>
        <label>Período Fim</label>
        <input v-model="formData.periodoFim" type="date" required />
      </div>
    </div>

    <input v-model="formData.local" placeholder="Local" required />

    <button type="submit" :disabled="uploading">Enviar</button>
  </form>

  <div v-if="uploading">
    <p>Processando... {{ progress }}%</p>
    <div class="progress-bar">
      <div class="progress" :style="{ width: progress + '%' }"></div>
    </div>
  </div>

  <p v-if="processedItems > 0">Itens processados: {{ processedItems }}</p>

  <ul>
    <li v-for="file in files" :key="file.name">{{ file.name }}</li>
  </ul>
</template>

<script setup>
import { ref, reactive } from "vue";
import axios from "axios";
import { useStore } from '@/stores/store';
const store = useStore();


const formData = reactive({
  nome: "",
  codProva: "",
  tipo: "",
  periodoInicio: "",
  periodoFim: "",
  local: "",
});

const files = ref([]);
const dragOver = ref(false);
const uploading = ref(false);
const progress = ref(0);
const processedItems = ref(0);

const handleDrop = (event) => {
  event.preventDefault();
  dragOver.value = false;
  files.value = [...files.value, ...event.dataTransfer.files]; // Evita sobrescrever arquivos
};

const handleFileSelect = (event) => {
  files.value = [...files.value, ...event.target.files]; // Evita sobrescrever arquivos
};

const uploadFiles = async () => {
  // Verifica se algum campo do formulário está vazio
  if (Object.values(formData).some((value) => !value)) {
    alert("Por favor, preencha todos os campos do formulário.");
    return;
  }

  // Verifica se há arquivos selecionados
  if (files.value.length === 0) {
    alert("Por favor, selecione pelo menos um arquivo.");
    return;
  }

  const data = new FormData();

  // Adiciona os arquivos
  files.value.forEach((file) => {
    data.append("file", file);
  });

  // Adiciona os campos do formulário
  Object.keys(formData).forEach((key) => {
    data.append(key, formData[key]);
  });

  try {
    uploading.value = true;
    progress.value = 0;

    const response = await axios.post(`${store.baseHttp}/fpafupload`, data, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress: (event) => {
        if (event.lengthComputable) {
          progress.value = Math.round((event.loaded / event.total) * 100);
        }
      }
    });

    const { inseridas, ignoradas, message } = response.data;

    processedItems.value = inseridas;

    alert(
      `Upload concluído!\n\n` +
      `${inseridas} linha(s) inserida(s).\n` +
      `${ignoradas} já existiam e foram ignoradas.`
    );

    // Limpa o formulário e os arquivos
    Object.keys(formData).forEach((key) => (formData[key] = ""));
    files.value = [];
    progress.value = 0;

  } catch (error) {
    console.error("Erro no upload:", error);
    alert("Ocorreu um erro ao enviar os arquivos.");
  } finally {
    uploading.value = false;
  }
};

</script>


  
<style scoped>
/* Área de arrastar e soltar */
.drop-area {
  border: 2px dashed #4caf50;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin-bottom: 15px;
}

.drop-area.dragging {
  background-color: #e8f5e9;
  border-color: #388e3c;
}

/* Formulário principal */
form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  margin: auto;
}

/* Estilização dos inputs */
form input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

/* Labels */
form label {
  font-weight: bold;
  margin-top: 5px;
}

/* Agrupamento dos inputs de período */
.periodo-container {
  display: flex;
  gap: 10px;
}

.periodo-container input {
  flex: 1; /* Faz com que ambos fiquem do mesmo tamanho */
}

/* Botão de envio */
button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 10px;
  transition: background-color 0.3s;
  width: 100%;
}

button:hover {
  background-color: #388e3c;
}

/* Barra de progresso */
.progress-bar {
  width: 100%;
  background-color: #f3f3f3;
  border-radius: 5px;
  height: 20px;
  margin-top: 10px;
  position: relative;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #4caf50;
  border-radius: 5px;
  transition: width 0.4s ease-in-out;
}

/* Lista de arquivos */
ul {
  list-style: none;
  padding: 0;
  max-width: 400px;
  margin: auto;
}

ul li {
  background: #fff;
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  text-align: center;
}
</style>