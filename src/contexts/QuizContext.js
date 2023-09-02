import { createContext, useContext, useReducer } from "react";

const QuizContext = createContext();

const questions = [
  {
    question: "Qual'è il framework/libreria di JS più popolare?",
    options: ["Angular", "React", "Svelte", "Vue"],
    correctOption: 1,
    points: 10,
  },
  {
    question: "Quale compagnia ha inventato React?",
    options: ["Google", "Apple", "Netflix", "Facebook"],
    correctOption: 3,
    points: 10,
  },
  {
    question: "Qual'è l'elemento fondamentale per costruire le App in React?",
    options: ["Components", "Blocks", "Elements", "Effects"],
    correctOption: 0,
    points: 10,
  },
  {
    question:
      "Qual'è il nome della sintassi che usiamo per descrivere l'UI nei componente di React?",
    options: ["FBJ", "Babel", "JSX", "ES2015"],
    correctOption: 2,
    points: 10,
  },
  {
    question: "In che modo i dati vengono trasmessi nelle app di React?",
    options: [
      "Dal genitore al figlio",
      "Dal figlio al genitore",
      "Entrambe le direzioni",
      "Decide lo sviluppatore",
    ],
    correctOption: 0,
    points: 10,
  },
  {
    question: "Come vengono passati i dati al componente figlio?",
    options: ["State", "Props", "PropTypes", "Parameters"],
    correctOption: 1,
    points: 10,
  },
  {
    question: "Quando bisogna usare il derived State?",
    options: [
      "Ogni volta che lo Stato non dovrebbe attivare un re-render",
      "Ogni volta che lo stato può essere sincronizzato con un effetto",
      "Ogni volta che lo Stato deve essere accessibile a tutti i componenti",
      "Ogni volta che lo stato può essere calcolato da un'altra variabile di stato",
    ],
    correctOption: 3,
    points: 30,
  },
  {
    question: "Cosa innesca un nuovo rendering dell' UI in React?",
    options: [
      "Attivare un effetto",
      "Passare i props",
      "Aggiornare lo stato",
      "Aggiungere un event listener agli elementi del Dom",
    ],
    correctOption: 2,
    points: 20,
  },
  {
    question: 'Quando possiamo "toccare" direttamente il DOM?',
    options: [
      "Quando dobbiamo 'sentire' un evento",
      "Quando dobbiamo cambiare la UI",
      "Quando dobbiamo aggiungere lo stile",
      "Mai",
    ],
    correctOption: 3,
    points: 20,
  },
  {
    question:
      "In qual situazione usiamo una callback per aggiornare uno state?",
    options: [
      "Quando l'aggiornamento dello state sarà lento",
      "Quando l'aggiornamento dello state'richiede un utilizzo intensivo di dati",
      "Quando l'aggiornamento dello state dovrebbe avvenire più velocemente",
      "Quando il nuovo state dipende dallo state precedente",
    ],
    correctOption: 3,
    points: 30,
  },
  {
    question:
      "Se passiamo una funzione allo useState, quando viene chiamata questa?",
    options: [
      "Ad ogni re-render",
      "Ogni volta che aggiorniamo lo state",
      "Solo al primo render",
      "La prima volta che aggiorniamo lo state",
    ],
    correctOption: 2,
    points: 30,
  },
  {
    question:
      "Quali sono gli hook usati per una richiesta API al render iniziale del componente?",
    options: ["useState", "useEffect", "useRef", "useReducer"],
    correctOption: 1,
    points: 10,
  },
  {
    question:
      "Quali variabili dovrebbero andare nella dependency array dello useEffect?",
    options: [
      "Generalmente nessuno",
      "Tutte la variabili del nostro state",
      "Tutti gli state e i props che fanno riferimento all' effect",
      "Tutte le variabili che abbiamo bisogno per la clean up",
    ],
    correctOption: 2,
    points: 30,
  },
  {
    question: "Un effect si attiva solo al render iniziale.",
    options: [
      "Vero",
      "Dipende dalla dependency array",
      "Falso",
      "Dipemde dal codice scritto nell'effect",
    ],
    correctOption: 0,
    points: 30,
  },
  {
    question: "Quando si attiva un effect se non c'è una dependency array?",
    options: [
      "Quando il componente si 'crea'",
      "Quando il componente viene 'distrutto'",
      "La prima volta che il componente va incontro al rendering",
      "Ogni volta ch il componente va incontro al rendering",
    ],
    correctOption: 3,
    points: 20,
  },
];

const SECS_PER_QUESTION = 30;

const initialState = {
  questions,

  // 'loading', 'error', 'ready', 'active', 'finished'
  status: "ready",
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        questions: action.payload,
        status: "ready",
      };
    case "dataFailed":
      return {
        ...state,
        status: "error",
      };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SECS_PER_QUESTION,
      };
    case "newAnswer":
      const question = state.questions.at(state.index);

      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };
    case "finish":
      return {
        ...state,
        status: "finished",
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };
    case "restart":
      return { ...initialState, questions: state.questions, status: "ready" };

    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };

    default:
      throw new Error("Action unkonwn");
  }
}

function QuizProvider({ children }) {
  const [
    { questions, status, index, answer, points, highscore, secondsRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce(
    (prev, cur) => prev + cur.points,
    0
  );

  // useEffect(function () {
  //   fetch("http://localhost:9000/questions")
  //     .then((res) => res.json())
  //     .then((data) => dispatch({ type: "dataReceived", payload: data }))
  //     .catch((err) => dispatch({ type: "dataFailed" }));
  // }, []);

  return (
    <QuizContext.Provider
      value={{
        questions,
        status,
        index,
        answer,
        points,
        highscore,
        secondsRemaining,
        numQuestions,
        maxPossiblePoints,

        dispatch,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined)
    throw new Error("QuizContext was used outside of the QuizProvider");
  return context;
}

export { QuizProvider, useQuiz };
