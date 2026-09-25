import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Radar } from 'react-chartjs-2';
import 'chart.js/auto';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const QUESTIONS = [
  'People are free to shape who they become.',
  'Morality should be guided by universal principles.',
  'Suffering can help us grow into wiser people.',
  'Life has a meaning waiting to be discovered.',
  'Reason should lead when choices are difficult.',
  'Emotions can be trusted as a guide to what matters.',
  'Our destiny is predetermined.',
  'Belief in a higher power is necessary for a meaningful life.',
  'Art can reveal truths that reason cannot.',
  'Honesty is the right choice even when it causes harm.',
  'Personal happiness is a worthy purpose for a life.',
  'A person can be deeply moral without religion.',
  'Existence is more important than essence.',
  'People are inherently good.',
  'Beauty is objective.',
  'Individual freedom should outweigh the collective good.',
  'Death is the end of our existence.',
  'Material possessions bring lasting happiness.',
  'Peace is more valuable than justice.',
  'Life should be driven more by passion than reason.',
  "A society's institutions shape people's opportunities.",
  'Education should be equally available to women and men.',
  'A society should be judged by how it treats its most vulnerable people.',
  'People should be free to pursue goals they have rationally chosen.',
  "A person's character grows through practicing self-discipline.",
  'We should focus on what is within our control and accept what is not.',
  'Poetry and art can express truths ordinary language misses.',
  'A good life depends on living in harmony with the natural world.',
  'History reveals patterns that help explain how societies rise and fall.',
  'Freedom is most meaningful when people can act together in public life.',
];
const QUESTION_EXPLANATIONS = {
  'People are free to shape who they become.': 'This asks whether your choices can shape your character and future. Or do you think your life is mostly decided by things outside your control?',
  'Morality should be guided by universal principles.': 'This asks whether the same basic rules about right and wrong should apply to everyone. Or should people decide what is right based on their own situation?',
  'Suffering can help us grow into wiser people.': 'This asks whether going through hard times can teach us something or make us stronger. It does not mean that suffering is always good or necessary.',
  'Life has a meaning waiting to be discovered.': 'This asks whether life has a purpose that already exists for us to find. Or do people make their own meaning as they live?',
  'Reason should lead when choices are difficult.': 'This asks whether careful thinking should guide hard decisions more than feelings do. Consider which one you tend to trust when the stakes are high.',
  'Emotions can be trusted as a guide to what matters.': 'This asks whether your feelings often help you understand what is important. Or do you think emotions can lead people in the wrong direction?',
  'Our destiny is predetermined.': 'This asks whether the future is already set, even if we cannot see it yet. Or do people have real choices that can change what happens?',
  'Belief in a higher power is necessary for a meaningful life.': 'This asks whether a person needs to believe in God or a higher power to have a meaningful life. Or can someone find meaning without that belief?',
  'Art can reveal truths that reason cannot.': 'This asks whether stories, music, or images can help us understand things that logic alone may miss. Think of art as a way of seeing, not just entertainment.',
  'Honesty is the right choice even when it causes harm.': 'This asks whether telling the truth is always the right thing to do, even if it hurts someone. Or can there be times when kindness matters more than full honesty?',
  'Personal happiness is a worthy purpose for a life.': 'This asks whether making your own life happier is a good goal to aim for. It does not say that your happiness must matter more than everyone else’s.',
  'A person can be deeply moral without religion.': 'This asks whether someone can know right from wrong and act kindly without following a religion. Or do you think religion is needed to guide a moral life?',
  'Existence is more important than essence.': 'This asks whether the life you actually live matters more than any fixed nature or role you were born with. In simple terms: do your choices make you who you are?',
  'People are inherently good.': 'This asks whether people are mostly kind and well-intentioned by nature. Or do you think people mostly look out for themselves unless society teaches them otherwise?',
  'Beauty is objective.': 'This asks whether some things are beautiful no matter who is looking at them. Or is beauty entirely a matter of personal taste?',
  'Individual freedom should outweigh the collective good.': 'This asks whether people should usually be free to choose for themselves, even when a group might benefit from a different choice. It is about balancing personal freedom with shared needs.',
  'Death is the end of our existence.': 'This asks whether a person stops existing completely when they die. Or do you believe some part of a person continues afterward?',
  'Material possessions bring lasting happiness.': 'This asks whether owning things can keep making someone happy over time. Or does that happiness usually fade, no matter what someone owns?',
  'Peace is more valuable than justice.': 'This asks whether keeping things calm is more important than correcting unfairness and holding people accountable. Which should come first when they conflict?',
  'Life should be driven more by passion than reason.': 'This asks whether strong interests and feelings should guide your life more than careful planning and logic. You can value both; choose which should lead.',
  "A society's institutions shape people's opportunities.": 'This asks whether things like schools, laws, and workplaces affect the chances people get in life. Or do you think individual effort matters much more than these systems?',
  'Education should be equally available to women and men.': 'This asks whether women and men should have the same chance to learn and study. Agree if access to education should not depend on someone’s gender.',
  'A society should be judged by how it treats its most vulnerable people.': 'This asks whether we can tell how fair a society is by looking at how it treats people with the least power or support. Think of people facing poverty, illness, or exclusion.',
  'People should be free to pursue goals they have rationally chosen.': 'This asks whether people should be allowed to follow life goals they have thought through for themselves. Or should their goals sometimes be limited for other reasons?',
  "A person's character grows through practicing self-discipline.": 'This asks whether repeatedly practicing habits like patience and self-control helps build someone’s character. It is about what practice can do over time.',
  'We should focus on what is within our control and accept what is not.': 'This asks whether it is better to spend effort on things you can influence and let go of things you cannot. For example, your choices are yours; other people’s reactions are not.',
  'Poetry and art can express truths ordinary language misses.': 'This asks whether poems, paintings, or music can communicate ideas that everyday words struggle to explain. Think about how a work of art can make you feel or understand something.',
  'A good life depends on living in harmony with the natural world.': 'This asks whether living well means respecting nature and the limits of the world around us. Or can people live well while shaping nature mainly to meet their needs?',
  'History reveals patterns that help explain how societies rise and fall.': 'This asks whether studying the past can show repeated causes behind a society’s success or decline. Or do you think each society’s story is too different for such patterns to help?',
  'Freedom is most meaningful when people can act together in public life.': 'This asks whether freedom is more than making private choices—whether people also need a voice in public decisions. Think of speaking up, joining with others, and helping shape shared rules.',
};

const EXTENSION_DIMENSIONS = [15, 1, 18, 15, 19, 4, 8, 18, 3, 15];
const withExtendedWeights = (profile) => ({
  ...profile,
  weights: [...profile.weights, ...EXTENSION_DIMENSIONS.map((dimension) => profile.weights[dimension])],
});

const THINKER_DETAILS = {
  'Albert Camus': ['Absurdism', 'Camus explored the tension between our search for meaning and a universe that offers no easy answers. He argued for facing that tension honestly and choosing solidarity, freedom, and a vivid life.', 'How can we live fully without pretending to have every answer?'],
  'Friedrich Nietzsche': ['Value creation', 'Nietzsche challenged inherited moral systems and asked how people might create values that affirm life. His work returns to self-overcoming, courage, and becoming who you are.', 'Which of your values have you chosen for yourself?'],
  'Søren Kierkegaard': ['Existential Christianity', 'Kierkegaard wrote about inwardness, anxiety, faith, and the responsibility of making personal commitments. For him, a life cannot be lived by hiding behind abstract rules.', 'What commitment would you make if no one else could choose for you?'],
  'Jean-Paul Sartre': ['Existentialism', 'Sartre argued that people are not born with a finished identity: our choices help make us who we are. Freedom therefore comes with responsibility for how we live.', 'What do your everyday choices say about the person you are becoming?'],
  'Immanuel Kant': ['Deontological ethics', 'Kant grounded morality in reason and duty. He asked whether the principle behind an action could be applied consistently to everyone, and insisted that people must be treated as ends in themselves.', 'Would you accept everyone following the rule behind your choice?'],
  'Plato': ['Idealism', 'Plato explored justice, knowledge, education, and the nature of reality through dialogues. His theory of Forms asks whether the changing world points toward deeper, enduring truths.', 'What makes something truly just or good?'],
  'Karl Marx': ['Historical materialism', 'Marx analyzed how economic structures shape society, politics, and daily life. His work examined class relations and argued for changing systems that produce exploitation.', 'How do the systems around us shape the choices we can make?'],
  'Gautama Buddha': ['Buddhist philosophy', 'Buddhist teachings examine suffering, its causes, and the possibility of release through ethical conduct, meditation, and insight. Compassion and attention to change are central themes.', 'What changes when you observe a difficult feeling without holding onto it?'],
  'Confucius': ['Confucian ethics', 'Confucius emphasized learning, humane conduct, ritual, and the responsibilities people hold within relationships. Personal virtue and social harmony grow through practice.', 'What do we owe the people closest to us?'],
  'Adi Shankaracharya': ['Advaita Vedanta', 'Shankara is associated with Advaita Vedanta, a non-dual tradition that investigates the relationship between the self and ultimate reality. Careful reasoning and spiritual inquiry both matter.', 'What might remain when surface distinctions fall away?'],
  'Guru Nanak': ['Sikh philosophy', 'Guru Nanak taught devotion to one God, equality, honest work, and service. His message challenged social divisions and connected spiritual life with care for others.', 'How can spiritual conviction show up as service in everyday life?'],
  'Fyodor Dostoevsky': ['Moral psychology', 'Dostoevsky used fiction to explore conscience, freedom, faith, guilt, and responsibility. His characters wrestle with the consequences of ideas when those ideas meet real human lives.', 'Can a person reason their way out of responsibility?'],
  'Franz Kafka': ['Modernist literature', 'Kafka portrayed people caught in opaque institutions and unsettling situations. His stories give vivid form to alienation, uncertainty, and the search for meaning in systems we cannot fully understand.', 'How do you keep your sense of self inside an impersonal system?'],
  'G. W. F. Hegel': ['German idealism', 'Hegel saw history and thought as dynamic processes. Conflicts between ideas and ways of life can drive change toward new forms of understanding and freedom.', 'What can a disagreement reveal that either side misses alone?'],
  'Islamic philosophy': ['A diverse intellectual tradition', 'Islamic philosophy spans many thinkers and schools, bringing reason, revelation, ethics, and questions about existence into conversation. It includes distinct approaches rather than a single unified doctrine.', 'How can reason and faith inform one another?'],
  'Ibn Khaldun': ['Philosophy of history', 'Ibn Khaldun examined how social bonds, political authority, economics, and geography shape civilizations. His Muqaddimah offers a method for questioning historical reports and looking for social causes.', 'What forces help a community hold together, and what makes that bond weaken?'],
  'Mary Wollstonecraft': ['Enlightenment feminism', 'Wollstonecraft argued that women appear less capable when denied the education and independence needed to develop their reason. Her work connects equality with the conditions that let people become responsible agents.', 'Which inequalities are sustained by denying people the chance to learn?'],
  'Simone de Beauvoir': ['Existentialist feminism', 'De Beauvoir analyzed how freedom is lived within social conditions that can restrict it. Her philosophy connects personal choice with responsibility for the freedom of others.', 'How can we take responsibility for our own freedom while supporting others’ freedom?'],
  'Ayn Rand': ['Objectivism', 'Rand developed Objectivism, a philosophy centered on reason, individual rights, and rational self-interest. Her views are influential and contested; her essays make the argument directly.', 'What obligations, if any, do people have to one another?'],
  'Marcus Aurelius': ['Stoicism', 'Marcus Aurelius applied Stoic ideas to public duty and private conduct. His Meditations is a collection of personal notes about judgment, self-discipline, mortality, and acting well with others.', 'What is within your control in a difficult situation?'],
  'Epictetus': ['Stoicism', 'Epictetus taught that freedom begins by distinguishing what depends on us—especially our judgments and choices—from what does not. His surviving teachings were recorded by his student Arrian.', 'Which part of this situation is actually yours to choose?'],
  'Rumi': ['Sufi poetry', 'Rumi’s poetry explores love, spiritual longing, transformation, and the search for the divine. Read in translation, the poems reward attention to their imagery as well as their spiritual context.', 'What might love ask you to see differently?'],
  'Lao Tzu': ['Daoism', 'The Dao De Jing, traditionally associated with Lao Tzu, reflects on the Dao, simplicity, humility, and action that does not force outcomes. It is a short poetic text with many interpretive translations.', 'Where might less force lead to a better result?'],
  'Zhuangzi': ['Daoism', 'The Zhuangzi uses playful stories and shifts in perspective to question rigid distinctions and certainty. Its Inner Chapters are often recommended as an accessible place to begin.', 'What changes when you try seeing this from another point of view?'],
  'Hannah Arendt': ['Political philosophy', 'Arendt wrote about political action, public life, power, and the conditions that allow people to appear and act together. The Human Condition examines labor, work, and action as distinct parts of human life.', 'What can people accomplish together that they cannot do alone?'],
};
const SCALE_LABELS = ['Strongly disagree', 'Disagree', 'Neither agree nor disagree', 'Agree', 'Strongly agree'];

const READING_STARTERS = {
  'Albert Camus': [{ title: 'The Myth of Sisyphus', note: 'A direct introduction to Camus on absurdity and revolt.' }],
  'Friedrich Nietzsche': [{ title: 'On the Genealogy of Morality', note: 'A focused entry into his critique of moral values.' }],
  'Søren Kierkegaard': [{ title: 'Fear and Trembling', note: 'A compact, challenging work on faith and individual responsibility.' }],
  'Jean-Paul Sartre': [{ title: 'Existentialism Is a Humanism', note: 'A short introduction to freedom, choice, and responsibility.' }],
  'Immanuel Kant': [{ title: 'Groundwork of the Metaphysics of Morals', note: 'Kant’s concise statement of duty and moral principles.' }],
  Plato: [{ title: 'Apology', note: 'A short dialogue and an accessible first encounter with Socrates.' }, { title: 'Republic', note: 'A longer inquiry into justice, education, and political life.' }],
  'Karl Marx': [{ title: 'The Communist Manifesto', note: 'A brief political text; read alongside a historical introduction.' }],
  'Gautama Buddha': [{ title: 'The Dhammapada', note: 'A collection of short verses; translations differ, so an edition with notes helps.' }],
  Confucius: [{ title: 'The Analects', note: 'Conversations and sayings on virtue, learning, and relationships.' }],
  'Adi Shankaracharya': [{ title: 'Upadeśasāhasrī (A Thousand Teachings)', note: 'A primary text introducing Shankara’s Advaita Vedanta.' }],
  'Guru Nanak': [{ title: 'Selections from the Guru Granth Sahib', note: 'Read with a Sikh-authored translation or commentary for context.' }],
  'Fyodor Dostoevsky': [{ title: 'The Brothers Karamazov', note: 'A novel exploring freedom, faith, responsibility, and suffering.' }],
  'Franz Kafka': [{ title: 'The Trial', note: 'A novel about guilt, authority, and opaque institutions.' }],
  'G. W. F. Hegel': [{ title: 'Phenomenology of Spirit', note: 'A major but demanding work; a guide or companion is useful.' }],
  'Islamic philosophy': [{ title: 'A History of Islamic Philosophy — Majid Fakhry', note: 'A broad secondary introduction to a diverse tradition.' }],
  'Ibn Khaldun': [{ title: 'The Muqaddimah', note: 'Start with the sections on society, group solidarity, and political power.' }],
  'Mary Wollstonecraft': [{ title: 'A Vindication of the Rights of Woman', note: 'Her argument for women’s education and equal moral agency.' }],
  'Simone de Beauvoir': [{ title: 'The Ethics of Ambiguity', note: 'A philosophical entry point before taking on the longer The Second Sex.' }],
  'Ayn Rand': [{ title: 'The Virtue of Selfishness', note: 'A collection of essays presenting her Objectivist ethics; it is controversial and worth reading critically.' }],
  'Marcus Aurelius': [{ title: 'Meditations', note: 'Personal Stoic reflections on judgment, character, and public duty.' }],
  Epictetus: [{ title: 'Enchiridion (Handbook)', note: 'A brief practical summary; follow it with selected Discourses.' }],
  Rumi: [{ title: 'The Masnavi', note: 'Begin with selected stories in a translation that explains their Sufi context.' }],
  'Lao Tzu': [{ title: 'Dao De Jing (Tao Te Ching)', note: 'Compare translations; the short poetic chapters allow multiple readings.' }],
  Zhuangzi: [{ title: 'Zhuangzi — Inner Chapters', note: 'A good first section for its stories, humor, and shifting perspectives.' }],
  'Hannah Arendt': [{ title: 'The Human Condition', note: 'Her account of labor, work, and political action in public life.' }],
};

const THINKERS = [
  { name: 'Albert Camus', description: 'The absurdist who urged us to meet an indifferent universe with clarity, courage, and defiance.', weights: [4,3,2,5,4,4,4,4,4,4,5,3,4,4,3,3,3,3,3,5] },
  { name: 'Friedrich Nietzsche', description: 'A fierce advocate for self-overcoming and creating values fit for a life fully lived.', weights: [5,4,5,5,4,5,5,3,5,4,5,4,4,5,3,4,4,4,4,3] },
  { name: 'Søren Kierkegaard', description: 'An inward-looking thinker on faith, personal responsibility, and the risks of choosing.', weights: [3,3,3,5,3,3,5,4,2,5,4,5,4,3,4,4,3,2,3,4] },
  { name: 'Jean-Paul Sartre', description: 'The existentialist who held that freedom and responsibility are inseparable.', weights: [5,4,5,5,3,3,3,5,3,5,4,5,4,5,4,3,3,4,3,5] },
  { name: 'Immanuel Kant', description: 'A moral philosopher who asked us to act from principles we could will for everyone.', weights: [3,3,4,3,4,3,1,1,4,3,3,5,2,1,3,4,4,1,3,4] },
  { name: 'Plato', description: 'A seeker of lasting truths, ideal forms, and wisdom guided by reason.', weights: [3,4,3,3,4,3,4,4,2,3,3,4,3,4,2,2,3,4,2,4] },
  { name: 'Karl Marx', description: 'A critic of class and power who imagined a more equal social order.', weights: [3,4,2,2,4,2,4,3,2,3,4,2,2,3,5,2,2,4,4,4] },
  { name: 'Gautama Buddha', description: 'A teacher of compassion, mindful attention, and freedom from needless suffering.', weights: [2,3,3,4,2,3,2,4,3,3,2,3,4,5,3,2,3,2,4,3] },
  { name: 'Confucius', description: 'A thinker of virtue, learning, and the responsibilities we hold in relationship.', weights: [3,3,4,3,3,4,4,3,3,3,3,3,3,5,2,5,3,5,3,3] },
  { name: 'Adi Shankaracharya', description: 'A philosopher of non-duality who explored the unity beneath apparent difference.', weights: [3,2,3,4,4,5,4,5,2,4,3,4,4,2,3,3,4,4,3,4] },
  { name: 'Guru Nanak', description: 'A teacher of devotion, equality, honest work, and service to others.', weights: [4,3,3,2,4,3,5,4,4,5,3,3,5,4,4,3,2,2,5,3] },
  { name: 'Fyodor Dostoevsky', description: 'A novelist who examined conscience, suffering, freedom, and the struggle for faith.', weights: [4,4,4,5,4,4,3,4,4,5,3,4,4,4,4,4,3,4,4,5] },
  { name: 'Franz Kafka', description: 'A writer of alienation, uncertainty, and the strange machinery of modern life.', weights: [4,4,3,4,4,3,4,3,2,4,4,2,3,3,4,4,3,2,4,5] },
  { name: 'G. W. F. Hegel', description: 'A philosopher of history and change, shaped by the tensions within human ideas.', weights: [5,3,5,3,4,3,4,4,3,4,3,3,2,3,5,3,5,4,3,3] },
  { name: 'Islamic philosophy', description: 'A rich tradition bringing reason and revelation into conversation about justice and existence.', weights: [4,1,3,2,2,4,4,2,4,5,4,3,3,3,2,2,4,4,4,2] },
  { name: 'Ibn Khaldun', description: 'A historian and social thinker who studied how solidarity, power, and economic life shape civilizations.', weights: [4,3,3,3,4,3,4,3,3,4,3,3,3,4,2,4,3,3,4,3] },
  { name: 'Mary Wollstonecraft', description: 'An Enlightenment writer who argued that equal education is essential to women’s freedom and moral development.', weights: [5,5,3,3,5,3,2,2,4,5,4,5,5,3,3,5,2,2,4,4] },
  { name: 'Simone de Beauvoir', description: 'An existentialist philosopher who examined freedom, gender, and the social conditions that shape a life.', weights: [5,4,4,3,4,4,3,3,4,4,4,5,5,3,2,5,3,2,4,4] },
  { name: 'Ayn Rand', description: 'The founder of Objectivism, known for defending reason, individual rights, and rational self-interest.', weights: [5,2,2,2,5,2,2,1,2,4,5,3,5,2,2,1,3,5,1,5] },
  { name: 'Marcus Aurelius', description: 'A Roman emperor and Stoic whose private notes reflect on character, duty, and what lies within our control.', weights: [3,4,4,3,5,3,4,3,3,5,3,4,3,3,3,4,4,2,4,3] },
  { name: 'Epictetus', description: 'A Stoic teacher who emphasized freedom through sound judgment and attention to what we can control.', weights: [3,4,4,3,5,3,4,3,2,5,2,4,3,3,2,3,4,1,3,3] },
  { name: 'Rumi', description: 'A Persian poet and Sufi mystic whose work explores love, spiritual longing, and transformation.', weights: [4,3,4,5,2,5,4,5,5,4,4,4,4,5,3,3,4,2,4,5] },
  { name: 'Lao Tzu', description: 'The tradition-linked author of the Dao De Jing, associated with simplicity and acting in accord with the Dao.', weights: [2,3,4,4,3,4,4,4,4,3,2,3,3,4,3,2,3,2,4,2] },
  { name: 'Zhuangzi', description: 'A Daoist writer whose stories question rigid certainty and invite a wider view of change and nature.', weights: [3,3,4,3,3,4,3,3,5,3,2,3,3,4,2,2,3,2,4,2] },
  { name: 'Hannah Arendt', description: 'A political thinker of public life, shared action, freedom, and the conditions of political responsibility.', weights: [4,4,3,3,4,3,3,2,4,5,3,4,4,3,3,5,3,2,5,3] },
];

const ALL_THINKERS = THINKERS.map(withExtendedWeights);
const getReadingStarters = (thinker) => {
  if (thinker.featuredWorks?.length) return thinker.featuredWorks;
  const name = thinker.name.toLowerCase();
  const key = Object.keys(READING_STARTERS).find((candidate) => {
    const normalized = candidate.toLowerCase();
    return name === normalized || name.includes(normalized) || normalized.includes(name)
      || (name.includes('hegel') && normalized.includes('hegel'));
  });
  return READING_STARTERS[key] || [];
};

function scoreMatches(answers, thinkers) {
  return thinkers.map(({ name, weights }) => {
    const dimensions = Math.min(answers.length, weights.length);
    const centeredAnswers = answers.slice(0, dimensions).map((value) => value - 3);
    const centeredWeights = weights.slice(0, dimensions).map((value) => value - 3);
    const dot = centeredAnswers.reduce((sum, value, index) => sum + value * centeredWeights[index], 0);
    const magnitudeA = Math.sqrt(centeredAnswers.reduce((sum, value) => sum + value * value, 0));
    const magnitudeB = Math.sqrt(centeredWeights.reduce((sum, value) => sum + value * value, 0));
    const similarity = magnitudeA && magnitudeB ? dot / (magnitudeA * magnitudeB) : 0;
    return { name, percent: Math.round(((similarity + 1) / 2) * 100) };
  }).sort((a, b) => b.percent - a.percent);
}

function App() {
  const [questions, setQuestions] = useState(QUESTIONS.map((text) => ({ text })));
  const [thinkers, setThinkers] = useState(ALL_THINKERS);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(3));
  const [results, setResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [openExplanation, setOpenExplanation] = useState(null);
  const [screen, setScreen] = useState('home');
  const [expandedThinker, setExpandedThinker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const questionsPerPage = 5;
  const pageCount = Math.ceil(questions.length / questionsPerPage);
  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage);

  useEffect(() => {
    let active = true;
    axios.get(`${API}/questions`).then((response) => {
      if (active && response.data.length) {
        setQuestions(response.data);
        setAnswers(Array(response.data.length).fill(3));
      }
    }).catch(() => {
      if (active) setNotice('Using the built-in assessment. Connect the API to load database questions.');
    });
    axios.get(`${API}/philosophers`).then((response) => {
      if (active && response.data.length) setThinkers(response.data);
    }).catch(() => {
      if (active) setNotice('Using the built-in thinker profiles.');
    });
    return () => { active = false; };
  }, []);

  const handleChange = (index, value) => {
    setAnswers((previous) => previous.map((answer, i) => i === index ? Number(value) : answer));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setNotice('');
    try {
      const response = await axios.post(`${API}/submit`, { answers });
      setResults(response.data);
      const scoredDimensions = Math.min(answers.length, Math.max(0, ...thinkers.map((thinker) => thinker.weights?.length || 0)));
      if (scoredDimensions < answers.length) setNotice(`Your matches currently use ${scoredDimensions} scored questions. The remaining ${answers.length - scoredDimensions} are saved in your response but need philosopher profile weights before they can affect your score.`);
    } catch (error) {
      const localProfiles = thinkers.filter((thinker) => Array.isArray(thinker.weights) && thinker.weights.length > 0);
      if (localProfiles.length) {
        setResults(scoreMatches(answers, localProfiles));
        const scoredDimensions = Math.min(answers.length, Math.max(...localProfiles.map((thinker) => thinker.weights.length)));
        setNotice(scoredDimensions < answers.length
          ? `Calculated on this device using ${scoredDimensions} scored questions. The remaining ${answers.length - scoredDimensions} need philosopher profile weights before they can affect your score.`
          : 'Your results were calculated on this device.');
      } else {
        setResults(scoreMatches(answers, ALL_THINKERS));
        setNotice('Your results were calculated using the built-in thinker profiles.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setAnswers(Array(questions.length).fill(3));
    setCurrentPage(0);
    setNotice('');
    setScreen('home');
  };

  const topMatches = useMemo(() => results ? [...results].sort((a, b) => b.percent - a.percent).slice(0, 3) : [], [results]);
  const descriptions = new Map(thinkers.map((thinker) => [thinker.name, thinker.description]));
  const thinkerDetails = (name) => {
    const normalizedName = name.toLowerCase();
    const knownName = Object.keys(THINKER_DETAILS).find((candidate) => {
      const normalizedCandidate = candidate.toLowerCase();
      return normalizedName === normalizedCandidate
        || normalizedName.includes(normalizedCandidate)
        || normalizedCandidate.includes(normalizedName)
        || (normalizedName.includes('hegel') && normalizedCandidate.includes('hegel'));
    });
    return THINKER_DETAILS[knownName] || ['Philosophical tradition', descriptions.get(name) || 'A perspective to explore.', 'What question would you ask this thinker?'];
  };

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="#home" onClick={handleReset} aria-label="Socratic Spectrum home"><img className="brand-mark" src={`${process.env.PUBLIC_URL}/socratic-spectrum-mark.svg`} alt="" /> <span>SOCRATIC SPECTRUM</span></a>
        <nav className="site-nav" aria-label="Main navigation">
          <button className={`nav-link ${screen === 'home' ? 'active' : ''}`} onClick={() => { setScreen('home'); setResults(null); }}>Home</button>
          <button className={`nav-link ${screen === 'thinkers' ? 'active' : ''}`} onClick={() => { setScreen('thinkers'); setResults(null); }}>Meet the thinkers</button>
          <button className="nav-cta" onClick={() => { setScreen('quiz'); setResults(null); setCurrentPage(0); }}>Take the reflection ↗</button>
        </nav>
      </header>

      {screen === 'home' && !results && <section className="hero content-width">
        <p className="eyebrow">A PHILOSOPHICAL SELF-PORTRAIT</p>
        <h1>Find the ideas<br /><em>that feel like yours.</em></h1>
        <p className="hero-copy">Thoughtful questions. A constellation of thinkers. A fresh way to see the values shaping your view of the world.</p>
        {notice && <p className="notice" role="status">{notice}</p>}
        <button className="primary-button" onClick={() => { setScreen('quiz'); setNotice(''); }}>Begin the reflection <span aria-hidden="true">↗</span></button>
        <div className="hero-meta"><span>{questions.length} QUESTIONS</span><i /> <span>ABOUT {Math.max(4, Math.ceil(questions.length / 5))} MINUTES</span><i /> <span>NO RIGHT ANSWERS</span></div>
        <button className="thinker-intro" onClick={() => setScreen('thinkers')}><span>CURIOUS ABOUT THE THINKERS?</span><p>Meet the philosophers in our collection <b aria-hidden="true">→</b></p></button>
      </section>}

      {screen === 'thinkers' && !results && <section className="directory content-width">
        <p className="eyebrow">THE THINKER'S LIBRARY</p>
        <h1>Meet the minds<br /><em>behind the ideas.</em></h1>
        <p className="directory-intro">Explore {thinkers.length} philosophers and traditions in your results. Each offers a different way to question how we should live, what we can know, and what matters.</p>
        <div className="thinker-grid">{thinkers.map((thinker, index) => {
          const [tradition, about, prompt] = thinkerDetails(thinker.name);
          const readings = getReadingStarters(thinker);
          const expanded = expandedThinker === thinker.name;
          return <article className={`thinker-card ${expanded ? 'expanded' : ''}`} key={thinker._id || thinker.name}>
            <span className="thinker-card-number">{String(index + 1).padStart(2, '0')}</span>
            <p className="thinker-tradition">{tradition}</p>
            <h2>{thinker.name}</h2>
            <p className="thinker-summary">{thinker.description}</p>
            {expanded && <div className="thinker-extra"><p>{about}</p><p className="thinker-prompt">A question to sit with: <em>{prompt}</em></p>{readings.length > 0 && <div className="reading-suggestions"><p className="reading-heading">A good place to start</p>{readings.map((work) => <div className="reading-item" key={work.title}><strong>{work.title}</strong><span>{work.note}</span><a href={`https://books.google.com/books?q=${encodeURIComponent(`${work.title} ${thinker.name}`)}`} target="_blank" rel="noreferrer">Find a copy ↗</a></div>)}</div>}</div>}
            <button className="read-more" aria-expanded={expanded} onClick={() => setExpandedThinker(expanded ? null : thinker.name)}>{expanded ? 'Read less −' : 'Read about them +'}</button>
          </article>;
        })}</div>
        <div className="directory-footer"><p>Ready to see which perspectives resonate with you?</p><button className="primary-button" onClick={() => { setCurrentPage(0); setScreen('quiz'); }}>Begin the reflection <span>↗</span></button></div>
      </section>}

      {screen === 'quiz' && !results && <section className="quiz content-width">
        <div className="quiz-heading"><div><p className="eyebrow">YOUR REFLECTION</p><h1>Let your instincts answer.</h1></div><button className="text-button" onClick={handleReset}>Exit</button></div>
        <div className="progress-meta"><span>REFLECTION {String(currentPage + 1).padStart(2, '0')} / {String(pageCount).padStart(2, '0')}</span><span>{Math.round(((startIndex + currentQuestions.length) / questions.length) * 100)}%</span></div>
        <div className="progress-track"><span style={{ width: `${((currentPage + 1) / pageCount) * 100}%` }} /></div>
        <div className="question-list">{currentQuestions.map((question, offset) => {
          const index = startIndex + offset;
          const value = answers[index] ?? 3;
          const explanationId = `question-help-${index}`;
          const isExplanationOpen = openExplanation === index;
          return <article className="question-card" key={question._id || index}>
            <div className="question-number">{String(index + 1).padStart(2, '0')}</div>
            <div className="question-content"><div className="question-title-row"><h2>{question.text}</h2><button className="question-help-toggle" type="button" aria-label={`${isExplanationOpen ? 'Hide' : 'Show'} simple explanation for question ${index + 1}`} aria-expanded={isExplanationOpen} aria-controls={explanationId} onClick={() => setOpenExplanation(isExplanationOpen ? null : index)}>i</button></div>
              {isExplanationOpen && <p className="question-help" id={explanationId} role="note">{QUESTION_EXPLANATIONS[question.text] || 'In simple terms, this asks whether you agree with the idea in this statement. Choose the answer that comes closest to what you think.'}</p>}
              <div className="scale-options" role="group" aria-label={`Your answer to: ${question.text}`}>{SCALE_LABELS.map((label, optionIndex) => { const option = optionIndex + 1; return <button key={option} className={`scale-option ${value === option ? 'selected' : ''}`} aria-label={`${option}: ${label}`} aria-pressed={value === option} onClick={() => handleChange(index, option)}><strong>{option}</strong><small>{label}</small></button>; })}</div>
              <p className="answer-caption">Choose how much you agree with this statement.</p>
            </div>
          </article>;
        })}</div>
        <div className="quiz-controls"><button className="secondary-button" onClick={() => setCurrentPage((page) => page - 1)} disabled={currentPage === 0}>← Previous</button>{currentPage < pageCount - 1 ? <button className="primary-button" onClick={() => { setCurrentPage((page) => page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Continue <span>→</span></button> : <button className="primary-button" onClick={handleSubmit} disabled={loading}>{loading ? 'Reading your answers…' : 'Reveal my spectrum ↗'}</button>}</div>
        {notice && <p className="notice" role="status">{notice}</p>}
      </section>}

      {results && <section className="results content-width">
        <p className="eyebrow">YOUR PHILOSOPHICAL SELF-PORTRAIT</p><h1>Your ideas have <em>company.</em></h1><p className="hero-copy">These traditions share some of your instincts. Think of them as conversation starters, not labels.</p>
        <div className="results-grid"><div className="chart-card"><p className="card-eyebrow">THE WIDER SPECTRUM</p><div className="chart-wrap"><Radar data={{ labels: results.map((item) => item.name), datasets: [{ label: 'Affinity', data: results.map((item) => item.percent), backgroundColor: 'rgba(204, 98, 67, .15)', borderColor: '#c25c40', pointBackgroundColor: '#c25c40', borderWidth: 2 }] }} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: '#e7e1d7' }, angleLines: { color: '#e7e1d7' }, pointLabels: { color: '#534d43', font: { size: 11 } } } }, plugins: { legend: { display: false } } }} /></div></div>
          <div className="matches"><p className="card-eyebrow">CLOSEST CURRENTS</p>{topMatches.map((match, index) => { const readings = getReadingStarters(thinkers.find((thinker) => thinker.name === match.name) || { name: match.name }); return <article className="match-card" key={match.name}><span className="match-rank">0{index + 1}</span><div className="match-info"><div className="match-title"><h2>{match.name}</h2><span>{match.percent}% affinity</span></div><div className="match-track"><span style={{ width: `${match.percent}%` }} /></div><p>{descriptions.get(match.name) || 'A perspective worth exploring.'}</p>{readings.length > 0 && <div className="match-reading"><span>READ NEXT</span>{readings.map((work) => <div key={work.title}><strong>{work.title}</strong><small>{work.note}</small><a href={`https://books.google.com/books?q=${encodeURIComponent(`${work.title} ${match.name}`)}`} target="_blank" rel="noreferrer">Find a copy ↗</a></div>)}</div>}</div></article>; })}</div>
        </div>
        <div className="results-footer"><p>People are more than a score. Let this be a starting point for your own questions.</p><button className="secondary-button" onClick={handleReset}>← Start again</button></div>{notice && <p className="notice" role="status">{notice}</p>}
      </section>}

      <footer className="site-footer"><span className="footer-brand"><img src={`${process.env.PUBLIC_URL}/socratic-spectrum-mark.svg`} alt="" /> SOCRATIC SPECTRUM</span><span>Curiosity before certainty.</span></footer>
    </main>
  );
}

export default App;
