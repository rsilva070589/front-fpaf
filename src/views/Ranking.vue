<template>
  <button @click="store.listaSelecionada = null">voltar</button>
  

  <div style="display: flex; justify-content: center; align-items: flex-start; width: 100%;">
    <div style="max-width: 600px; width: 100%; margin-left: -250px;">

      <div style="font-size: 25px;"> Prova: {{ store.listaSelecionada }}</div>
      <table style="width: 100%; border-collapse: collapse; text-align: center;">
        <thead>
          <tr>
            <th>Posição</th>
            <th class="col-atleta">Atleta</th>
            <th>Equipe</th>
            <th>5 Melhores</th>
            <th>Total</th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
            <th>4</th>
            <th>5</th>
            <th>6</th>
            <th>7</th>
            <th>8</th>
            <th>Média</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(participant, index) in participantesOrdenados" 
            :key="participant.waid"
          >
            <td>{{ index+1}}</td>
            <td class="col-atleta">{{ participant.atleta }}</td>
            <td>{{ participant.equipe }}</td>
            <td>{{participant.topFive}}</td>
            <td>{{ participant.Score1 + participant.Score2 + participant.Score3 + participant.Score4 + participant.Score5 + 
              participant.Score6 + participant.Score7 + participant.Score8
             }}</td>
            <td :class="{ 'highlight-yellow-score': shouldHighlightScore(participant, 1, globalLastPopulatedScoreColumnIndex) }">{{ participant.Score1 }}</td>
            <td :class="{ 'highlight-yellow-score': shouldHighlightScore(participant, 2, globalLastPopulatedScoreColumnIndex) }">{{ participant.Score2 }}</td>
            <td :class="{ 'highlight-yellow-score': shouldHighlightScore(participant, 3, globalLastPopulatedScoreColumnIndex) }">{{ participant.Score3 }}</td>
            <td :class="{ 'highlight-yellow-score': shouldHighlightScore(participant, 4, globalLastPopulatedScoreColumnIndex) }">{{ participant.Score4 }}</td>
            <td :class="{ 'highlight-yellow-score': shouldHighlightScore(participant, 5, globalLastPopulatedScoreColumnIndex) }">{{ participant.Score5 }}</td>
            <td :class="{ 'highlight-yellow-score': shouldHighlightScore(participant, 6, globalLastPopulatedScoreColumnIndex) }">{{ participant.Score6 }}</td>
            <td :class="{ 'highlight-yellow-score': shouldHighlightScore(participant, 7, globalLastPopulatedScoreColumnIndex) }">{{ participant.Score7 }}</td>
            <td :class="{ 'highlight-yellow-score': shouldHighlightScore(participant, 8, globalLastPopulatedScoreColumnIndex) }">{{ participant.Score8 }}</td>
            <td>{{ participant.mediaValida.toFixed() }}</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 20px; text-align: right; font-size: 14px;">
        <span style="background-color: yellow; padding: 2px 5px; border-radius: 3px; margin-right: 5px;">&nbsp;</span>
        <span style="font-style: italic;">*em amarelo, resultado provisório por 15 dias</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from '@/stores/store';

const store = useStore();

const participants = ref([]); 

const page = ref(1);
const pageSize = 20;
const totalPages = ref(1);

/**
 * Calculates the sum of the top 5 scores for a participant.
 * @param {Object} participant - The participant object with scores.
 * @returns {number} The sum of the top 5 scores.
 */
function topFiveSum(participant) {
  const scores = [
    participant.Score1,
    participant.Score2,
    participant.Score3,
    participant.Score4,
    participant.Score5,
    participant.Score6,
    participant.Score7,
    participant.Score8
  ].filter(s => s != null); // Filter null scores before sorting and summing

  return scores
    .sort((a, b) => b - a)     // Sort in descending order
    .slice(0, 5)               // Take the top 5
    .reduce((acc, val) => acc + val, 0); // Sum
}

/**
 * Computed property to determine the highest-numbered score column that has
 * at least one non-null value across all participants in the current list.
 * This will be our "global last populated score column".
 */
const globalLastPopulatedScoreColumnIndex = computed(() => {
  let maxIndex = -1; // Represents no scores populated yet (or Score0 if we had one)

  const currentParticipants = store.participantes.filter(p => p.prova === store.listaSelecionada);

  for (const participant of currentParticipants) {
    const scores = [
      participant.Score1, participant.Score2, participant.Score3, participant.Score4,
      participant.Score5, participant.Score6, participant.Score7, participant.Score8
    ];
    
    // Find the last non-null score index for this individual participant
    let individualLastNonNullScoreIndex = -1;
    for (let i = scores.length - 1; i >= 0; i--) {
      if (scores[i] !== null) {
        individualLastNonNullScoreIndex = i;
        break; 
      }
    }
    
    // Update maxIndex if this participant's last non-null score is higher
    if (individualLastNonNullScoreIndex > maxIndex) {
      maxIndex = individualLastNonNullScoreIndex;
    }
  }
  return maxIndex; // This is the 0-indexed column number (0 to 7)
});


/**
 * Determines if a score cell should be highlighted in yellow based on the collective rule.
 * @param {Object} participant - The participant object.
 * @param {number} scoreNumber - The score number of the current cell (1 to 8).
 * @param {number} globalHighlightIndex - The 0-indexed column number that should be highlighted globally.
 * @returns {boolean} True if the score should be highlighted, false otherwise.
 */
const shouldHighlightScore = (participant, scoreNumber, globalHighlightIndex) => {
  // Only highlight if 'integrado_ha_15_dias' is 'Não'
  if (participant.integrado_ha_15_dias === 'Não') {
    // Get the actual score value for the current column being checked.
    const scoresArray = [
      participant.Score1, participant.Score2, participant.Score3, participant.Score4,
      participant.Score5, participant.Score6, participant.Score7, participant.Score8
    ];
    const scoreValue = scoresArray[scoreNumber - 1]; // Access the correct score by its 0-indexed position.

    // Only highlight if the score value is NOT null AND
    // the current score column matches the globally determined highlight column.
    return scoreValue !== null && (scoreNumber - 1) === globalHighlightIndex;
  }
  return false; // Do not highlight if integrated for 15 days
};

// Computed property for filtered and ordered participants
const participantesOrdenados = computed(() => {
  const filtrados = store.participantes.filter(p => p.prova === store.listaSelecionada);
  return filtrados
    .map(p => {
      const scores = [
        p.Score1, p.Score2, p.Score3, p.Score4,
        p.Score5, p.Score6, p.Score7, p.Score8
      ];

      const scoresValidos = scores.filter(s => s != null && s !== 0);
      
      const total = scores.reduce((acc, val) => acc + (val || 0), 0);
      
      const mediaValida = scoresValidos.length > 0
        ? (scoresValidos.reduce((acc, val) => acc + val, 0) / scoresValidos.length)
        : 0;

      return {
        ...p,
        total,
        topFive: topFiveSum(p),
        mediaValida
      };
    })
    .filter(p => p.total > 0) 
    .sort((a, b) => b.topFive - a.topFive)
    .map((p, index) => ({
      ...p,
      Categoria_Rank: index + 1
    }));
});
</script>

<style scoped>
 
.highlight-yellow-score {
  background-color: yellow;
}

.participant-table {
  font-family: Arial, sans-serif;
  margin: 20px;
  width: 100%;
  overflow-x: auto;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination button {
  padding: 5px 10px;
  margin: 0 5px;
  cursor: pointer;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #007BFF;
  color: white;
  font-weight: bold;
}

tr:hover {
  background-color: initial;
}

td:hover {
  background-color: #ddd;
}

td {
  color: #333;
}

@media (max-width: 768px) {
  th, td {
    padding: 8px;
    font-size: 14px;
  }
}

.col-atleta {
  width: 150px;
  min-width: 150px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>