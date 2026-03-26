export interface Question {
  id: number;
  text: string;
  options: { label: string; value: string }[];
}

export interface EssayTopic {
  id: number;
  title: string;
  prompt: string;
}

export interface ExamType {
  id: string;
  label: string;
  description: string;
  text1Title: string;
  text1Passage: string;
  text1Range: string;
  text2Title: string;
  text2Passage: string;
  text2Range: string;
  readingQuestions: Question[];
  correctAnswers: Record<number, string>;
  essayTopics: EssayTopic[];
}

// ─── Type A ───

const typeA: ExamType = {
  id: "A",
  label: "Type A",
  description: "Stone Age & Hudson River",
  text1Title: "Text 1",
  text1Passage: `The early history of humanity is divided by historians into broad periods based on the materials used for tools and weapons. The earliest period, the Stone Age, began over two million years ago. During this time, humans learned to sharpen stone into useful tools and weapons. The technique of sharpening stone was gradually refined over thousands of years. Eventually, humans discovered that metals could also be shaped into tools. The first metal to be widely used was copper, but copper tools were too soft for many tasks. Around 3000 B.C., people learned to mix copper with tin to create bronze, a much harder metal. This was the beginning of the Bronze Age. Later, around 1200 B.C., humans learned to extract iron from ore, marking the start of the Iron Age. Iron was superior to bronze in many ways — it was harder, more durable, and more plentiful.`,
  text1Range: "1–5",
  text2Title: "Text 2",
  text2Passage: `With the inauguration of the Erie Canal in 1825, the Hudson River became one of the busiest waterways in the United States. Steamboats and sailing ships carried goods and people up and down the river constantly. The era of the steamboat lasted from about 1825 to 1850, and during this time, these magnificent vessels were the primary means of transportation along the river. After 1850, however, railroads began to take over as the main form of transportation. The age of the great paddle-wheelers came to an end as trains proved to be faster and more reliable. By the early twentieth century, tugboats and barges were almost the only watercraft left on the river.`,
  text2Range: "6–10",
  readingQuestions: [
    {
      id: 1,
      text: "Historians have divided early human history into broad periods according to terms that refer to",
      options: [
        { label: "A", value: "how people communicated" },
        { label: "B", value: "how people governed themselves" },
        { label: "C", value: "the religions people practiced" },
        { label: "D", value: "materials used for tools and weapons" },
      ],
    },
    {
      id: 2,
      text: "Which of the following is said of the system used for dividing early history into periods?",
      options: [
        { label: "A", value: "It has been widely accepted by historians" },
        { label: "B", value: "It is based on technological developments" },
        { label: "C", value: "It was recently introduced" },
        { label: "D", value: "It refers only to European history" },
      ],
    },
    {
      id: 3,
      text: "During the period called the Stone Age, what happened to the technique of sharpening stone?",
      options: [
        { label: "A", value: "It remained unchanged for millions of years" },
        { label: "B", value: "It was gradually refined over time" },
        { label: "C", value: "It was abandoned in favor of metal tools" },
        { label: "D", value: "It was only used for weapons" },
      ],
    },
    {
      id: 4,
      text: "According to the passage, which age began around 3000 B.C.?",
      options: [
        { label: "A", value: "Bronze Age" },
        { label: "B", value: "Stone Age" },
        { label: "C", value: "Iron Age" },
        { label: "D", value: "Copper Age" },
      ],
    },
    {
      id: 5,
      text: "It can be inferred that copper was first used to make which of the following?",
      options: [
        { label: "A", value: "Statues" },
        { label: "B", value: "Axes" },
        { label: "C", value: "Wheels" },
        { label: "D", value: "Pots" },
      ],
    },
    {
      id: 6,
      text: "Which of the following is the best title for this passage?",
      options: [
        { label: "A", value: "Rivers in the United States" },
        { label: "B", value: "Steamboats and Paddle-Wheelers" },
        { label: "C", value: "The Opening of the Erie Canal" },
        { label: "D", value: "The Hudson River in the Nineteenth Century" },
      ],
    },
    {
      id: 7,
      text: "The steamboats on the Hudson River primarily carried",
      options: [
        { label: "A", value: "goods and people" },
        { label: "B", value: "weapons and animals" },
        { label: "C", value: "water and oil" },
        { label: "D", value: "gold and silver" },
      ],
    },
    {
      id: 8,
      text: "It can be inferred that the era of the steamboat on the Hudson River ended around",
      options: [
        { label: "A", value: "1825" },
        { label: "B", value: "1850" },
        { label: "C", value: "1880" },
        { label: "D", value: "1910" },
      ],
    },
    {
      id: 9,
      text: "According to the passage, after 1850, most transportation shifted to travel by",
      options: [
        { label: "A", value: "wagon" },
        { label: "B", value: "plane" },
        { label: "C", value: "train" },
        { label: "D", value: "car" },
      ],
    },
    {
      id: 10,
      text: "According to the passage, what type of watercraft remained on the river in the early twentieth century?",
      options: [
        { label: "A", value: "Steamboats" },
        { label: "B", value: "Sailing ships" },
        { label: "C", value: "Cargo schooners" },
        { label: "D", value: "Barges" },
      ],
    },
  ],
  correctAnswers: {
    1: "D",
    2: "B",
    3: "B",
    4: "A",
    5: "B",
    6: "D",
    7: "A",
    8: "B",
    9: "C",
    10: "D",
  },
  essayTopics: [
    {
      id: 1,
      title: "Topic 1",
      prompt:
        "Learning a second language is important in today's globalized world. Discuss the benefits of learning a second language and how it can impact your personal and professional life.",
    },
    {
      id: 2,
      title: "Topic 2",
      prompt:
        "Is it better to learn English in an English-speaking country or in your home country? Discuss the advantages and disadvantages of each approach and state your opinion.",
    },
  ],
};

// ─── Type B ───

const typeB: ExamType = {
  id: "B",
  label: "Type B",
  description: "E.F.T. Banking & Probability Theory",
  text1Title: "Text 1",
  text1Passage: `An electronic funds transfer system — called E. F. T. in banking circles — is replacing the paperwork in banking processes. With its use of computers to carry out financial transactions, E. F. T. is changing the way people pay bills and may eliminate the necessity for carrying cash. But there is a snag in this technological revolution, and that is the reluctance of consumers to change their habits. Regardless of whether or not consumers like it, bankers are determined to fully implement the new system. The full use of E. F. T. nevertheless may be a quarter century away.`,
  text1Range: "1–5",
  text2Title: "Text 2",
  text2Passage: `The theory of probability had its origins in the world of gambling and superstition. In an age when superstition and witchcraft held sway, it emerged from the unfavorable conditions of the gambling house. Despite its humble beginnings, the theory of probability has had a profound influence on scientific thought. While its practical contributions are indisputable, there remain philosophical disagreements about its meaning and application. The purpose of this passage is to build a working definition of the word "probability."`,
  text2Range: "6–10",
  readingQuestions: [
    {
      id: 1,
      text: "According to the passage, what is the problem with the electronic funds transfer system?",
      options: [
        { label: "A", value: "The machinery breaks down." },
        { label: "B", value: "The field of electronics is not advanced enough." },
        { label: "C", value: "People do not like to adopt new ideas." },
        { label: "D", value: "It takes too long to pay bills." },
      ],
    },
    {
      id: 2,
      text: "According to the passage, what is the immediate benefit of the electronic funds transfer system?",
      options: [
        { label: "A", value: "It pays a higher interest rate than other systems." },
        { label: "B", value: "It eliminates the need for traditional record keeping." },
        { label: "C", value: "It eliminates the need for banks." },
        { label: "D", value: "It changes people's habits." },
      ],
    },
    {
      id: 3,
      text: "One possible result of fully implementing the electronic funds transfer system would be that",
      options: [
        { label: "A", value: "people might not have to handle money." },
        { label: "B", value: "people might find the money to pay their bills more easily." },
        { label: "C", value: "bank charges might be eliminated." },
        { label: "D", value: "paperwork might be increased." },
      ],
    },
    {
      id: 4,
      text: "According to the passage, bankers want to",
      options: [
        { label: "A", value: "wait a quarter of a century before starting the E. F. T. system." },
        { label: "B", value: "begin immediate use of the E. F. T. system." },
        { label: "C", value: "have more research done to improve the E. F. T. system." },
        { label: "D", value: "implement the E. F. T. system in a limited number of banks." },
      ],
    },
    {
      id: 5,
      text: "According to the passage, what is the future of the electronic funds transfer system?",
      options: [
        { label: "A", value: "It may be widely accepted very soon." },
        { label: "B", value: "It may take at least twenty-five years before it is commonly used." },
        { label: "C", value: "It may never be widely used because there are not enough people able to operate the machinery." },
        { label: "D", value: "It may only be a nuisance, creating more paperwork and bother." },
      ],
    },
    {
      id: 6,
      text: "According to the passage, the theory of probability began",
      options: [
        { label: "A", value: "with many failures." },
        { label: "B", value: "at the same time as Euclid's geometry." },
        { label: "C", value: "as a superstition." },
        { label: "D", value: "under unfavorable conditions." },
      ],
    },
    {
      id: 7,
      text: "The theory of probability was originated to",
      options: [
        { label: "A", value: "reinforce the effectiveness of dares or curses." },
        { label: "B", value: "increase the predictability of winning in games of chance." },
        { label: "C", value: "overcome the hostility of the environment." },
        { label: "D", value: "find out why some people are lucky and others unlucky." },
      ],
    },
    {
      id: 8,
      text: "According to the passage, what important effect has probability theory had?",
      options: [
        { label: "A", value: "It has enabled people to understand and adapt to their experiences better." },
        { label: "B", value: "It has led to increased technological development." },
        { label: "C", value: "It has profoundly influenced the course of natural events." },
        { label: "D", value: "It has resolved philosophical questions about the meaning of probability measures." },
      ],
    },
    {
      id: 9,
      text: "One of the points made in the passage about the theory of probability is that",
      options: [
        { label: "A", value: "its applications have gone far beyond its original use." },
        { label: "B", value: "it has gone specifically beyond the thought of Euclid and Newton." },
        { label: "C", value: "it has made gambling both more fashionable and more reputable." },
        { label: "D", value: "its practical applications are more significant than its philosophical or mathematical foundations." },
      ],
    },
    {
      id: 10,
      text: "Which aspect of probability theory does the author prefer not to discuss?",
      options: [
        { label: "A", value: "The questions of origins" },
        { label: "B", value: "The practical contributions" },
        { label: "C", value: "The controversial issues" },
        { label: "D", value: "The future uses" },
      ],
    },
  ],
  correctAnswers: {
    1: "C",
    2: "B",
    3: "A",
    4: "B",
    5: "B",
    6: "D",
    7: "B",
    8: "A",
    9: "A",
    10: "C",
  },
  essayTopics: [
    {
      id: 1,
      title: "Topic 1",
      prompt:
        "Do you agree or disagree with the following statement? Classmates are a more important influence than parents on a child's success in school. Use specific reasons and examples to support your answer.",
    },
    {
      id: 2,
      title: "Topic 2",
      prompt:
        "Some people believe that success in life comes from taking risks or chances. Others believe that success results from careful planning. In your opinion, what does success come from? Use specific reasons and examples to support your answer.",
    },
  ],
};

// ─── Type C ───

const typeC: ExamType = {
  id: "C",
  label: "Type C",
  description: "Grand Canyon & Aluminum",
  text1Title: "Text 1",
  text1Passage: `The Grand Canyon, a long, narrow gorge in Arizona, is rich in geological history. Its record of past plant and animal life also makes it an exciting and invaluable object of study for biologists. Using samples from the two hundred and seventeen miles of the canyon's walls, scientists analyze the building materials that form the earth's surface and study the natural processes which have affected the canyon over its four-billion-year history. These processes include the eruption of volcanoes, which were active as recently as one thousand years ago, and gradual decomposition by erosion. Scientists also study a great variety of fossils that can be found in the canyon. These imprints of past forms of life are preserved in rock. The lower levels of canyon rock contain fossils of seashells and primitive algae, while the upper levels contain fossils of such creatures as dinosaurs and other prehistoric land animals. All of these discoveries provide scientists with information both on the earth's history in general and on the area around the Grand Canyon in particular.`,
  text1Range: "1–5",
  text2Title: "Text 2",
  text2Passage: `Aluminum was discovered about one hundred and fifty years ago, and it has been manufactured commercially for half that time. It now ranks second only to iron and steel in serving human needs.

The key to its popularity is its incredible versatility. The same metal that makes kitchen foil serves as armor for battlefield tanks. The material of lawn chairs and baseball bats also forms the vital parts of air and space vehicles—the frames, skins, even the rivets.

Behind aluminum's versatility lie properties so diverse that they almost seem to belong to several different metals. For example, in its pure form, aluminum is soft enough to whittle.

Yet its alloys can possess the strength of steel, with only a third of its weight. Thus, when Alexander Calder designed one of his last mobiles—a soaring creation eighty feet long—his choice of aluminum over steel cut two tons from its weight.

Aluminum also assures the masterpiece virtually immortality. The instant the metal is exposed to air, its surface acquires a transparent film that seals the interior against further corrosion.`,
  text2Range: "6–10",
  readingQuestions: [
    {
      id: 1,
      text: "What is the main topic of this passage?",
      options: [
        { label: "A", value: "The fascination of geological history." },
        { label: "B", value: "The effect of volcanoes on the Grand Canyon." },
        { label: "C", value: "Prehistoric plants and animals." },
        { label: "D", value: "A canyon's record of natural history." },
      ],
    },
    {
      id: 2,
      text: "Why is the Grand Canyon of particular interest?",
      options: [
        { label: "A", value: "It contains a wealth of information in its walls." },
        { label: "B", value: "Modern plant and animal life there is varied and exciting." },
        { label: "C", value: "There is great potential mineral wealth in the canyon." },
        { label: "D", value: "Published history of the area is already detailed and complete." },
      ],
    },
    {
      id: 3,
      text: "According to the passage, why is the Grand Canyon of special importance to the geologist?",
      options: [
        { label: "A", value: "It reveals much of the earth's past." },
        { label: "B", value: "It is longer and deeper than any other canyon." },
        { label: "C", value: "It has suffered little destruction over the years." },
        { label: "D", value: "It is completely dry all year long." },
      ],
    },
    {
      id: 4,
      text: "Scientists can learn about previous life in the area by studying",
      options: [
        { label: "A", value: "current animal life." },
        { label: "B", value: "impressions in rocks." },
        { label: "C", value: "feeding habits of dinosaurs." },
        { label: "D", value: "construction materials." },
      ],
    },
    {
      id: 5,
      text: "Which of the following statements about the Grand Canyon can be concluded from the passage?",
      options: [
        { label: "A", value: "It is much older than other parts of the United States." },
        { label: "B", value: "It contains more levels than other canyons." },
        { label: "C", value: "Its history is more varied and accessible than that of other areas." },
        { label: "D", value: "Its former habitation by dinosaurs was an unexpected discovery." },
      ],
    },
    {
      id: 6,
      text: "According to the passage, the use of aluminum is",
      options: [
        { label: "A", value: "greater than that of any other metal" },
        { label: "B", value: "equal to that of iron" },
        { label: "C", value: "less than that of steel" },
        { label: "D", value: "negligible" },
      ],
    },
    {
      id: 7,
      text: "According to the passage, aluminum is sometimes used to make which of the following?",
      options: [
        { label: "A", value: "Photographic film" },
        { label: "B", value: "Frames for stuffed furniture" },
        { label: "C", value: "Foils and other fencing equipment" },
        { label: "D", value: "Parts of spaceships" },
      ],
    },
    {
      id: 8,
      text: "It can be inferred from the passage that aluminum has been marketed for how many years?",
      options: [
        { label: "A", value: "40" },
        { label: "B", value: "75" },
        { label: "C", value: "80" },
        { label: "D", value: "150" },
      ],
    },
    {
      id: 9,
      text: "The most important feature of aluminum is that it",
      options: [
        { label: "A", value: "can be used for many different things" },
        { label: "B", value: "is soft enough to whittle" },
        { label: "C", value: "is strong" },
        { label: "D", value: "can be marketed in pure form" },
      ],
    },
    {
      id: 10,
      text: "It can be inferred that a steel object weighing three tons would weigh how many tons if it were made of aluminum?",
      options: [
        { label: "A", value: "One" },
        { label: "B", value: "Three" },
        { label: "C", value: "Six" },
        { label: "D", value: "Nine" },
      ],
    },
  ],
  correctAnswers: {
    1: "D",
    2: "A",
    3: "A",
    4: "B",
    5: "C",
    6: "C",
    7: "D",
    8: "B",
    9: "A",
    10: "A",
  },
  essayTopics: [
    {
      id: 1,
      title: "Topic 1",
      prompt:
        "What is a very important skill a person should learn in order to be successful in the world today? Choose one skill and use specific reasons and examples to support your choice.",
    },
    {
      id: 2,
      title: "Topic 2",
      prompt:
        "Some people like doing only what they already do well. Other people prefer to try new things and take risks. Which do you prefer? Use specific reasons and examples to support your choice.",
    },
  ],
};

export const examTypes: ExamType[] = [typeA, typeB, typeC];

export function getExamByType(type: string): ExamType {
  return examTypes.find((e) => e.id === type) || typeA;
}
