import { flagIcon } from "@/mock/topicAssets";
import { phraseAudioPath } from "@/services/audioCatalog";
import type { TopicWord } from "@/types/topic";

interface CountrySeed {
  slug: string;
  word: string;
  phonetic: string;
  meaning: string;
  sentence: string;
  sentenceCn: string;
  group: "asia" | "europe" | "americas" | "africa" | "oceania";
}

const countrySeeds: CountrySeed[] = [
  { slug: "china", word: "China", phonetic: "/ˈtʃaɪnə/", meaning: "中国", sentence: "I live in China.", sentenceCn: "我住在中国。", group: "asia" },
  { slug: "japan", word: "Japan", phonetic: "/dʒəˈpæn/", meaning: "日本", sentence: "This is Japan.", sentenceCn: "这是日本。", group: "asia" },
  { slug: "south-korea", word: "South Korea", phonetic: "/saʊθ kəˈriːə/", meaning: "韩国", sentence: "This is South Korea.", sentenceCn: "这是韩国。", group: "asia" },
  { slug: "india", word: "India", phonetic: "/ˈɪndiə/", meaning: "印度", sentence: "This is India.", sentenceCn: "这是印度。", group: "asia" },
  { slug: "singapore", word: "Singapore", phonetic: "/ˈsɪŋəpɔːr/", meaning: "新加坡", sentence: "This is Singapore.", sentenceCn: "这是新加坡。", group: "asia" },
  { slug: "thailand", word: "Thailand", phonetic: "/ˈtaɪlænd/", meaning: "泰国", sentence: "Thailand is warm.", sentenceCn: "泰国很温暖。", group: "asia" },
  { slug: "vietnam", word: "Vietnam", phonetic: "/ˌviːetˈnɑːm/", meaning: "越南", sentence: "This is Vietnam.", sentenceCn: "这是越南。", group: "asia" },
  { slug: "malaysia", word: "Malaysia", phonetic: "/məˈleɪʒə/", meaning: "马来西亚", sentence: "This is Malaysia.", sentenceCn: "这是马来西亚。", group: "asia" },
  { slug: "indonesia", word: "Indonesia", phonetic: "/ˌɪndəˈniːʒə/", meaning: "印度尼西亚", sentence: "Indonesia has many islands.", sentenceCn: "印度尼西亚有许多岛屿。", group: "asia" },
  { slug: "philippines", word: "Philippines", phonetic: "/ˈfɪləpiːnz/", meaning: "菲律宾", sentence: "This is the Philippines.", sentenceCn: "这是菲律宾。", group: "asia" },
  { slug: "pakistan", word: "Pakistan", phonetic: "/ˈpækɪstæn/", meaning: "巴基斯坦", sentence: "This is Pakistan.", sentenceCn: "这是巴基斯坦。", group: "asia" },
  { slug: "saudi-arabia", word: "Saudi Arabia", phonetic: "/ˌsaʊdi əˈreɪbiə/", meaning: "沙特阿拉伯", sentence: "This is Saudi Arabia.", sentenceCn: "这是沙特阿拉伯。", group: "asia" },
  { slug: "united-arab-emirates", word: "United Arab Emirates", phonetic: "/juˈnaɪtɪd ˈærəb ˈemərɪts/", meaning: "阿拉伯联合酋长国", sentence: "This is the United Arab Emirates.", sentenceCn: "这是阿拉伯联合酋长国。", group: "asia" },
  { slug: "turkey", word: "Turkey", phonetic: "/ˈtɜːrki/", meaning: "土耳其", sentence: "This is Turkey.", sentenceCn: "这是土耳其。", group: "asia" },
  { slug: "russia", word: "Russia", phonetic: "/ˈrʌʃə/", meaning: "俄罗斯", sentence: "Russia is very big.", sentenceCn: "俄罗斯很大。", group: "asia" },
  { slug: "united-kingdom", word: "United Kingdom", phonetic: "/juːˈnaɪtɪd ˈkɪŋdəm/", meaning: "英国", sentence: "This is the United Kingdom.", sentenceCn: "这是英国。", group: "europe" },
  { slug: "france", word: "France", phonetic: "/fræns/", meaning: "法国", sentence: "This is France.", sentenceCn: "这是法国。", group: "europe" },
  { slug: "germany", word: "Germany", phonetic: "/ˈdʒɜːrməni/", meaning: "德国", sentence: "This is Germany.", sentenceCn: "这是德国。", group: "europe" },
  { slug: "italy", word: "Italy", phonetic: "/ˈɪtəli/", meaning: "意大利", sentence: "This is Italy.", sentenceCn: "这是意大利。", group: "europe" },
  { slug: "spain", word: "Spain", phonetic: "/speɪn/", meaning: "西班牙", sentence: "This is Spain.", sentenceCn: "这是西班牙。", group: "europe" },
  { slug: "greece", word: "Greece", phonetic: "/ɡriːs/", meaning: "希腊", sentence: "This is Greece.", sentenceCn: "这是希腊。", group: "europe" },
  { slug: "netherlands", word: "Netherlands", phonetic: "/ˈneðərləndz/", meaning: "荷兰", sentence: "This is the Netherlands.", sentenceCn: "这是荷兰。", group: "europe" },
  { slug: "belgium", word: "Belgium", phonetic: "/ˈbeldʒəm/", meaning: "比利时", sentence: "This is Belgium.", sentenceCn: "这是比利时。", group: "europe" },
  { slug: "switzerland", word: "Switzerland", phonetic: "/ˈswɪtsərlənd/", meaning: "瑞士", sentence: "Switzerland has mountains.", sentenceCn: "瑞士有高山。", group: "europe" },
  { slug: "sweden", word: "Sweden", phonetic: "/ˈswiːdən/", meaning: "瑞典", sentence: "This is Sweden.", sentenceCn: "这是瑞典。", group: "europe" },
  { slug: "norway", word: "Norway", phonetic: "/ˈnɔːrweɪ/", meaning: "挪威", sentence: "This is Norway.", sentenceCn: "这是挪威。", group: "europe" },
  { slug: "denmark", word: "Denmark", phonetic: "/ˈdenmɑːrk/", meaning: "丹麦", sentence: "This is Denmark.", sentenceCn: "这是丹麦。", group: "europe" },
  { slug: "finland", word: "Finland", phonetic: "/ˈfɪnlənd/", meaning: "芬兰", sentence: "Finland has many lakes.", sentenceCn: "芬兰有许多湖泊。", group: "europe" },
  { slug: "ireland", word: "Ireland", phonetic: "/ˈaɪərlənd/", meaning: "爱尔兰", sentence: "This is Ireland.", sentenceCn: "这是爱尔兰。", group: "europe" },
  { slug: "portugal", word: "Portugal", phonetic: "/ˈpɔːrtʃəɡəl/", meaning: "葡萄牙", sentence: "This is Portugal.", sentenceCn: "这是葡萄牙。", group: "europe" },
  { slug: "poland", word: "Poland", phonetic: "/ˈpoʊlənd/", meaning: "波兰", sentence: "This is Poland.", sentenceCn: "这是波兰。", group: "europe" },
  { slug: "austria", word: "Austria", phonetic: "/ˈɔːstriə/", meaning: "奥地利", sentence: "This is Austria.", sentenceCn: "这是奥地利。", group: "europe" },
  { slug: "czech-republic", word: "Czech Republic", phonetic: "/tʃek rɪˈpʌblɪk/", meaning: "捷克", sentence: "This is the Czech Republic.", sentenceCn: "这是捷克。", group: "europe" },
  { slug: "hungary", word: "Hungary", phonetic: "/ˈhʌŋɡəri/", meaning: "匈牙利", sentence: "This is Hungary.", sentenceCn: "这是匈牙利。", group: "europe" },
  { slug: "ukraine", word: "Ukraine", phonetic: "/juːˈkreɪn/", meaning: "乌克兰", sentence: "This is Ukraine.", sentenceCn: "这是乌克兰。", group: "europe" },
  { slug: "united-states", word: "United States", phonetic: "/juːˈnaɪtɪd steɪts/", meaning: "美国", sentence: "This is the United States.", sentenceCn: "这是美国。", group: "americas" },
  { slug: "canada", word: "Canada", phonetic: "/ˈkænədə/", meaning: "加拿大", sentence: "Canada is big.", sentenceCn: "加拿大很大。", group: "americas" },
  { slug: "mexico", word: "Mexico", phonetic: "/ˈmeksɪkoʊ/", meaning: "墨西哥", sentence: "This is Mexico.", sentenceCn: "这是墨西哥。", group: "americas" },
  { slug: "brazil", word: "Brazil", phonetic: "/brəˈzɪl/", meaning: "巴西", sentence: "Brazil is far away.", sentenceCn: "巴西在很远的地方。", group: "americas" },
  { slug: "argentina", word: "Argentina", phonetic: "/ˌɑːrdʒənˈtiːnə/", meaning: "阿根廷", sentence: "This is Argentina.", sentenceCn: "这是阿根廷。", group: "americas" },
  { slug: "chile", word: "Chile", phonetic: "/ˈtʃɪli/", meaning: "智利", sentence: "Chile is long and narrow.", sentenceCn: "智利又长又窄。", group: "americas" },
  { slug: "peru", word: "Peru", phonetic: "/pəˈruː/", meaning: "秘鲁", sentence: "This is Peru.", sentenceCn: "这是秘鲁。", group: "americas" },
  { slug: "colombia", word: "Colombia", phonetic: "/kəˈlʌmbiə/", meaning: "哥伦比亚", sentence: "This is Colombia.", sentenceCn: "这是哥伦比亚。", group: "americas" },
  { slug: "egypt", word: "Egypt", phonetic: "/ˈiːdʒɪpt/", meaning: "埃及", sentence: "Egypt has pyramids.", sentenceCn: "埃及有金字塔。", group: "africa" },
  { slug: "south-africa", word: "South Africa", phonetic: "/saʊθ ˈæfrɪkə/", meaning: "南非", sentence: "South Africa has many animals.", sentenceCn: "南非有许多动物。", group: "africa" },
  { slug: "kenya", word: "Kenya", phonetic: "/ˈkenjə/", meaning: "肯尼亚", sentence: "Kenya has many animals.", sentenceCn: "肯尼亚有许多动物。", group: "africa" },
  { slug: "nigeria", word: "Nigeria", phonetic: "/naɪˈdʒɪriə/", meaning: "尼日利亚", sentence: "This is Nigeria.", sentenceCn: "这是尼日利亚。", group: "africa" },
  { slug: "morocco", word: "Morocco", phonetic: "/məˈrɑːkoʊ/", meaning: "摩洛哥", sentence: "This is Morocco.", sentenceCn: "这是摩洛哥。", group: "africa" },
  { slug: "australia", word: "Australia", phonetic: "/ɔːˈstreɪliə/", meaning: "澳大利亚", sentence: "Australia has kangaroos.", sentenceCn: "澳大利亚有袋鼠。", group: "oceania" },
  { slug: "new-zealand", word: "New Zealand", phonetic: "/nuː ˈziːlənd/", meaning: "新西兰", sentence: "New Zealand has many sheep.", sentenceCn: "新西兰有许多绵羊。", group: "oceania" }
];

export const countryWords: TopicWord[] = countrySeeds.map((country) => ({
  id: `country_${country.slug.replace(/-/g, "_")}`,
  word: country.word,
  phonetic: country.phonetic,
  meaning: country.meaning,
  sentence: country.sentence,
  sentenceCn: country.sentenceCn,
  image: flagIcon(country.slug),
  audio: phraseAudioPath(`${country.word}. ${country.sentence}`),
  group: country.group
}));

export const countryGroupLabels: Record<CountrySeed["group"], string> = {
  asia: "亚洲",
  europe: "欧洲",
  americas: "美洲",
  africa: "非洲",
  oceania: "大洋洲"
};
