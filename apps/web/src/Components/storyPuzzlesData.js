// Expanded Library of 20 Lateral Thinking Puzzles with rigorous negative and positive rule matching

export const normalizePuzzleText = (str) => {
  if (!str) return '';
  return str
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const evaluateStoryQuestion = (story, query, isTr = true) => {
  if (!story || !query) {
    return {
      status: 'warning',
      answer: isTr ? '⚠️ UYARI: Soru Şekli Geçersiz' : '⚠️ WARNING: Invalid Format',
      explanation: isTr
        ? 'Lütfen sadece "Evet" veya "Hayır" cevabı verilebilecek sorular sorun!'
        : 'Please ask questions that can only be answered with Yes or No!'
    };
  }

  const normQuery = normalizePuzzleText(query);

  // 1. Open-ended question check
  const openEndedWords = [
    'neden', 'nicin', 'nasil', 'kim', 'kimin', 'ne zaman', 'nerede', 'nereden', 'ne kadar', 'kac', 'hangi',
    'why', 'how', 'who', 'where', 'when', 'what'
  ];

  const trimmed = query.trim();
  const isQuestionMark = trimmed.endsWith('?');
  const startsWithOpenEnded = openEndedWords.some(word =>
    normQuery === word || normQuery.startsWith(`${word} `) || normQuery.includes(` ${word} `)
  );

  const queryWords = normQuery.split(' ');
  const hasQuestionParticle = queryWords.includes('mi') || queryWords.includes('mu') || normQuery.endsWith(' mi') || normQuery.endsWith(' mu');

  const yesNoSuffixes = [
    'mi', 'mu', 'miydi', 'muydu', 'muydum', 'mudur', 'midir', 'var mi', 'yok mu', 'var mu', 'yok mu',
    'oldu mu', 'kaldi mi', 'etti mi', 'vurdu mu', 'isabet etti mi', 'is ', 'was ', 'did ', 'does ', 'can ', 'could ', 'would '
  ];
  const hasYesNoSuffix = hasQuestionParticle || yesNoSuffixes.some(suf => normQuery.includes(suf));

  if (startsWithOpenEnded || (!hasYesNoSuffix && !isQuestionMark && !normQuery.startsWith('is ') && !normQuery.startsWith('was ') && !normQuery.startsWith('did '))) {
    return {
      status: 'warning',
      answer: isTr ? '⚠️ UYARI: Soru Şekli Geçersiz' : '⚠️ WARNING: Invalid Format',
      explanation: isTr
        ? 'Lütfen sadece "Evet" veya "Hayır" cevabı verilebilecek sorular sorun! (Örnek: "Adam kör müydü?", "Karısı öldü mü?")'
        : 'Please ask questions that can only be answered with "Yes" or "No"!'
    };
  }

  // 2. Irrelevant detail check
  const isIrrelevant = (story.irrelevantKeywords || []).some(kw =>
    normQuery.includes(normalizePuzzleText(kw))
  );
  if (isIrrelevant) {
    return {
      status: 'irrelevant',
      answer: isTr ? 'Önemsiz' : 'Irrelevant',
      explanation: ''
    };
  }

  // 3. Strict Rules matching (Negative rules evaluated first, then positive rules)
  const matchedRule = (story.rules || []).find(rule =>
    rule.keywords.some(kw => normQuery.includes(normalizePuzzleText(kw)))
  );

  if (matchedRule) {
    const isYes = matchedRule.answer === 'Evet' || matchedRule.answer === 'YES' || matchedRule.answer === true;
    return {
      status: 'valid',
      answer: isYes ? (isTr ? 'EVET' : 'YES') : (isTr ? 'HAYIR' : 'NO'),
      explanation: ''
    };
  }

  // 4. Fallback check against keyFacts
  const factMatch = (story.keyFacts || []).some(fact =>
    normQuery.includes(normalizePuzzleText(fact))
  );

  return {
    status: 'valid',
    answer: factMatch ? (isTr ? 'EVET' : 'YES') : (isTr ? 'HAYIR' : 'NO'),
    explanation: ''
  };
};

export const STORIES = [
  {
    id: 'seagull-meat',
    titleTr: 'Martı Eti ve Kör Adam',
    titleEn: 'Seagull Meat and The Blind Man',
    difficulty: 'Zor',
    difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    promptTr: 'Bir adam karısıyla adaya uçmuşlar. Adam kör ve adada her gün martı eti yemiş, en sonunda şehre dönüp lokantada martı eti sipariş etmiş. Yediği ilk lokmadan sonra intihar etmiş. Neden?',
    promptEn: 'A man flew to an island with his wife. The man was blind and ate seagull meat every day on the island. Later, back in the city, he ordered seagull meat at a restaurant. After his first bite, he committed suicide. Why?',
    fullStoryTr: 'Uçak adaya düşer ve kaza sonucu adam gözlerini kaybeder. Karısıyla birlikte hayatta kalırlar. Karısı adam aç kalmasın diye dışarıda bulduğu kendi uzuvlarını ve et parçalarını adam beslensin diye "martı eti" diyerek yedirir. Kadın sonunda kan kaybından ölür. Adam kurtarılıp şehre döndüğünde bir lokantada gerçek martı eti yer. Tadının adadakiyle alakası olmadığını anlayınca adada yediği etin karısının eti olduğunu fark eder ve vicdan azabıyla intihar eder.',
    fullStoryEn: 'Their plane crashed on a deserted island, blinding the man. His wife kept him alive by cutting parts of her own flesh to feed him, telling him it was seagull meat. She eventually died of blood loss. Upon rescue, the man orders real seagull meat at a restaurant. Realizing the tastes are completely different, he understands he ate his wife\'s flesh to survive, and commits suicide out of remorse.',
    hintsTr: [
      'Adam adadayken yediği etin tadını unutmamıştı.',
      'Karısı adamı korumak ve yaşatmak için büyük bir fedakarlık yaptı.',
      'Lokantada yediği et GERÇEK martı etiydi.'
    ],
    hintsEn: [
      'The man remembered the taste of the meat he ate on the island.',
      'His wife made an extreme sacrifice to keep him fed.',
      'The meat at the restaurant was REAL seagull meat.'
    ],
    keyFacts: ['kaza', 'uçak', 'kör', 'uzuv', 'insan', 'karısı', 'fedakarlık', 'lokanta', 'gerçek', 'fark'],
    rules: [
      { keywords: ['doğuştan', 'doğuştan mı', 'doğuştan kör', 'born blind'], answer: 'Hayır' },
      { keywords: ['karısını mı öldürdü', 'öldürdü mü', 'karısını öldürdü', 'adam mı öldürdü', 'cinayet', 'murder'], answer: 'Hayır' },
      { keywords: ['adadaki et', 'martı eti miydi', 'adada yediği', 'was seagull'], answer: 'Hayır' },
      { keywords: ['lokantadaki et zehirli', 'zehirli miydi'], answer: 'Hayır' },
      { keywords: ['kazada mı', 'kazada gözlerini', 'sonradan mı', 'kazada kör', 'gözlerini mi kaybetti', 'blind from crash'], answer: 'Evet' },
      { keywords: ['uçak', 'kaza', 'düştü', 'plane', 'crash'], answer: 'Evet' },
      { keywords: ['karısı', 'kadın', 'öldü mü', 'wife', 'dead'], answer: 'Evet' },
      { keywords: ['insan eti', 'kendi eti', 'karısının eti', 'uzuv', 'flesh', 'human flesh'], answer: 'Evet' },
      { keywords: ['lokantadaki et', 'restorant', 'restaurant'], answer: 'Evet' },
      { keywords: ['intihar', 'suicide'], answer: 'Evet' },
      { keywords: ['kör', 'göz'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['şehir', 'ada ismi', 'uçak modeli', 'lokanta adı', 'garson', 'saat']
  },
  {
    id: 'elevator-man',
    titleTr: 'Asansördeki Adam',
    titleEn: 'The Elevator Man',
    difficulty: 'Orta',
    difficultyColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    promptTr: 'Bir adam gökdelenin 10. katında oturuyor. Her sabah asansörle 1. kata iniyor. Akşam dönerken 7. kata çıkıp 3 katı yürüyor. Ancak yağmurlu günlerde veya yanında biri varken 10. kata kadar çıkıyor. Neden?',
    promptEn: 'A man lives on the 10th floor. Every morning he takes the elevator down to 1st floor. Every evening he takes it to the 7th floor and walks 3 floors up. On rainy days or with company, he goes to the 10th floor. Why?',
    fullStoryTr: 'Adam cücedir ve boyu 10. kat düğmesine yetişmemektedir. En fazla 7. kat düğmesine uzanabilir. Yağmurlu günlerde şemsiyesini kullanarak 10. kat düğmesine basar, yanında biri olduğunda ise ondan basmasını ister.',
    fullStoryEn: 'The man is a dwarf and cannot reach the 10th floor button. He can only reach the 7th floor. On rainy days he uses an umbrella to hit the button, or asks others when accompanied.',
    hintsTr: [
      'Adamın fiziksel bir özelliği duruma sebep oluyor.',
      '7 ve 10. kat düğmeleri arasındaki tek fark yüksekliktir.',
      'Yağmurlu günlerde yanında taşıdığı bir nesne yardım eder.'
    ],
    hintsEn: [
      'A physical attribute of the man causes this.',
      'The difference between 7th and 10th floor button is height.',
      'An object he carries on rainy days helps him.'
    ],
    keyFacts: ['cüce', 'boyu kısa', 'düğme', 'yetişmiyor', 'şemsiye'],
    rules: [
      { keywords: ['spor', 'egzersiz', 'exercise', 'sağlık'], answer: 'Hayır' },
      { keywords: ['asansör bozuk', 'arızalı', 'broken'], answer: 'Hayır' },
      { keywords: ['cüce', 'boyu kısa', 'dwarf', 'short', 'küçük boylu'], answer: 'Evet' },
      { keywords: ['düğme', 'düğmeye yetişmiyor', 'yetişemiyor', 'reach', 'button'], answer: 'Evet' },
      { keywords: ['şemsiye', 'umbrella'], answer: 'Evet' },
      { keywords: ['10', '7', 'kat'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['işi ne', 'meslek', 'bina rengi', 'asansör markası']
  },
  {
    id: 'bar-water',
    titleTr: 'Bar Masasındaki Bardak Su',
    titleEn: 'Glass of Water at The Bar',
    difficulty: 'Kolay',
    difficultyColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    promptTr: 'Bir adam bara girip bir bardak su ister. Barmen silah çıkarıp adamın kafasına doğrultur. Adam "Teşekkür ederim" der ve su içmeden çıkar. Neden?',
    promptEn: 'A man asks a bartender for water. The bartender points a gun at him. The man says "Thank you" and leaves without drinking. Why?',
    fullStoryTr: 'Adam şiddetli hıçkırmaktadır ve hıçkırığı kesmek için su istemiştir. Barmen korkutarak hıçkırığı geçirmek için silah doğrultur. Adam hıçkırığının geçtiğini fark edince teşekkür eder ve çıkar.',
    fullStoryEn: 'The man had severe hiccups. The bartender pointed a gun to scare him and cure the hiccups. Once cured, the man thanked him and left.',
    hintsTr: [
      'Adamın zararsız ama rahatsız edici bir fiziksel durumu vardı.',
      'Barmen adama zarar vermek istemiyordu.',
      'Korkmak bu duruma iyi gelir.'
    ],
    hintsEn: [
      'The man had a harmless but annoying condition.',
      'The bartender did not want to harm him.',
      'Getting scared cures this condition.'
    ],
    keyFacts: ['hıçkırık', 'korkutmak', 'geçti', 'silah'],
    rules: [
      { keywords: ['düşman', 'borç', 'enemy', 'intikam', 'alacak', 'hırsız'], answer: 'Hayır' },
      { keywords: ['adamı öldürmek', 'vurmak istedi', 'ateş etti', 'shoot him'], answer: 'Hayır' },
      { keywords: ['susamış', 'thirsty', 'susuzluk'], answer: 'Hayır' },
      { keywords: ['hıçkırık', 'hıçkırığ', 'hıçkır', 'hiccup', 'hıçkırıyor'], answer: 'Evet' },
      { keywords: ['korkutmak', 'korktu', 'scare', 'frighten'], answer: 'Evet' },
      { keywords: ['geçti', 'kurtuldu', 'cured', 'iyileşti'], answer: 'Evet' },
      { keywords: ['silah', 'barmen', 'teşekkür'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['bar adı', 'silah markası', 'saat']
  },
  {
    id: 'desert-match',
    titleTr: 'Çöldeki Yanık Kibrit',
    titleEn: 'Burnt Match in The Desert',
    difficulty: 'Zor',
    difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    promptTr: 'Çölün ortasında çırılçıplak bir adam ölü bulunuyor. Elinde sönmüş yarım kibrit var. Çevrede hiç iz yok. Neden ölmüştür?',
    promptEn: 'A naked man is found dead in the desert holding half a burnt match. No footprints around. How did he die?',
    fullStoryTr: 'Adam arkadaşlarıyla sıcak hava balonundaydı. Balon irtifa kaybetmeye başlayınca hafiflemek için elbiselerini attılar. Yetmeyince aralarından birinin atlaması gerekti. Kibrit çektiler, kısa kibriti çeken adam balondan atladı.',
    fullStoryEn: 'He was in a falling hot air balloon with friends. They stripped to lose weight, then drew matches to decide who must jump. He drew the short match and jumped.',
    hintsTr: [
      'Adam gökyüzünden düştü.',
      'Kıyafetlerini hafiflemek için kendisi çıkardı.',
      'Kibrit çöpü kura çekimi içindi.'
    ],
    hintsEn: [
      'He fell from the sky.',
      'He stripped to shed weight.',
      'The match was for drawing lots.'
    ],
    keyFacts: ['balon', 'sıcak hava balonu', 'düştü', 'kura', 'kibrit', 'ağırlık'],
    rules: [
      { keywords: ['cinayet', 'biri mi vurdu', 'öldürüldü', 'murder'], answer: 'Hayır' },
      { keywords: ['uçak', 'plane'], answer: 'Hayır' },
      { keywords: ['susuzluk', 'güneş çarpması'], answer: 'Hayır' },
      { keywords: ['balon', 'sıcak hava balonu', 'balloon', 'hot air balloon'], answer: 'Evet' },
      { keywords: ['düştü', 'atladı', 'fall', 'jumped'], answer: 'Evet' },
      { keywords: ['kura', 'kibrit çekti', 'draw', 'match'], answer: 'Evet' },
      { keywords: ['ağırlık', 'hafiflemek', 'kıyafet', 'çıplak', 'stripped'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['çöl adı', 'kıyafet rengi']
  },
  {
    id: 'lighthouse-keeper',
    titleTr: 'Deniz Feneri Bekçisi',
    titleEn: 'The Lighthouse Keeper',
    difficulty: 'Orta',
    difficultyColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    promptTr: 'Bir adam gece yatmadan önce düğmeye basıp ışığı söndürür. Sabah gazeteyi okuyunca pencereden atlayarak intihar eder. Neden?',
    promptEn: 'A man turns off a light switch before going to sleep. Next morning he reads the newspaper and jumps out the window. Why?',
    fullStoryTr: 'Adam bir deniz feneri bekçisidir. Yanlışlıkla deniz fenerinin ışığını söndürmüştür. Gece fenerin ışığı yanmadığı için büyük bir yolcu gemisi kayalıklara çarpmış ve yüzlerce insan ölmüştür. Adam gazeteden bu felaketi öğrenince intihar eder.',
    fullStoryEn: 'He was a lighthouse keeper who accidentally turned off the lighthouse light. A large ship crashed into rocks overnight killing hundreds. Seeing the tragedy in the morning news, he committed suicide.',
    hintsTr: [
      'Adam normal bir evde oturmuyordu.',
      'Söndürdüğü ışık denizciler için hayati önem taşıyordu.',
      'Gazetedeki haber büyük bir gemi kazası hakkındaydı.'
    ],
    hintsEn: [
      'He didn\'t live in a normal house.',
      'The light he turned off was vital for sailors.',
      'The newspaper reported a massive shipwreck.'
    ],
    keyFacts: ['deniz feneri', 'gemi', 'kaza', 'çarptı', 'gazete', 'ışık'],
    rules: [
      { keywords: ['ev lambası', 'normal lamba', 'oda ışığı'], answer: 'Hayır' },
      { keywords: ['cinayet', 'öldürüldü'], answer: 'Hayır' },
      { keywords: ['fener', 'deniz feneri', 'lighthouse'], answer: 'Evet' },
      { keywords: ['gemi', 'kaza', 'batık', 'ship', 'crash', 'wreck'], answer: 'Evet' },
      { keywords: ['gazete', 'haber', 'newspaper'], answer: 'Evet' },
      { keywords: ['ışık', 'söndürdü', 'intihar', 'suicide'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['ev numarası', 'gazete adı', 'hava durumu']
  },
  {
    id: 'ice-block',
    titleTr: 'Kilitli Odadaki Su Birikintisi',
    titleEn: 'Pool of Water in Locked Room',
    difficulty: 'Zor',
    difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    promptTr: 'Kilitli boş bir odada tavandan asılı ölü bir adam var. Odada hiç eşya yok, sadece altında bir su birikintisi var. Nasıl asılmıştır?',
    promptEn: 'A man is hanged in a locked room with no furniture, only a pool of water beneath him. How did he hang himself?',
    fullStoryTr: 'Adam büyük bir buz kalıbının üzerine çıkıp ipi boynuna geçirdi. Buz eriyince adam havada asılı kaldı ve geriye sadece su kaldı.',
    fullStoryEn: 'He stood on a block of ice to put the noose around his neck. The ice melted over time, leaving only water.',
    hintsTr: ['Su önceden katı haldeydi.', 'Sıcaklık bir nesneyi eritti.'],
    hintsEn: ['The water was solid before.', 'Heat melted an object.'],
    keyFacts: ['buz', 'eridi', 'su', 'asıldı', 'intihar'],
    rules: [
      { keywords: ['cinayet', 'biri mi öldürdü', 'murder', 'katil'], answer: 'Hayır' },
      { keywords: ['sandalye', 'merdiven', 'chair', 'ladder'], answer: 'Hayır' },
      { keywords: ['boru', 'musluk', 'yağmur'], answer: 'Hayır' },
      { keywords: ['intihar', 'asıldı', 'kendini astı', 'hanged', 'suicide'], answer: 'Evet' },
      { keywords: ['buz', 'ice', 'buz kalıbı', 'block of ice'], answer: 'Evet' },
      { keywords: ['eridi', 'melt', 'erime'], answer: 'Evet' },
      { keywords: ['su', 'su birikintisi', 'water'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['ip tipi', 'oda rengi']
  },
  {
    id: 'tunnel-train',
    titleTr: 'Tüneldeki Tren ve Kör Adam',
    titleEn: 'Train in The Tunnel',
    difficulty: 'Zor',
    difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    promptTr: 'Göz ameliyatından dönen adam trende seyahat ederken trenin penceresinden atlayıp intihar eder. Neden?',
    promptEn: 'A man returning from eye surgery jumps out a moving train window. Why?',
    fullStoryTr: 'Adam daha önce kördü ve gözleri ameliyatla açılmıştı. Tren tünele girince ortalık karardı, ameliyatın başarısız olduğunu sanıp intihar etti.',
    fullStoryEn: 'He was blind and had surgery to restore sight. Entering a dark tunnel, he thought he went blind again and panicked.',
    hintsTr: ['Tren karanlık bir yere girdi.', 'Ameliyatın başarısız olduğunu sandı.'],
    hintsEn: ['Train entered darkness.', 'Thought surgery failed.'],
    keyFacts: ['tünel', 'karanlık', 'ameliyat', 'kör', 'tren'],
    rules: [
      { keywords: ['ameliyat başarısız', 'tekrar kör oldu', 'really blind again'], answer: 'Hayır' },
      { keywords: ['cinayet', 'biri mi attı', 'pushed'], answer: 'Hayır' },
      { keywords: ['daha önce kör', 'kör müydü', 'was blind'], answer: 'Evet' },
      { keywords: ['ameliyat', 'göz ameliyatı', 'surgery'], answer: 'Evet' },
      { keywords: ['tünel', 'tunnel', 'karanlık', 'dark'], answer: 'Evet' },
      { keywords: ['tekrar kör olduğunu sandı', 'panik', 'sandı'], answer: 'Evet' },
      { keywords: ['tren', 'atladı', 'intihar', 'jump'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['bilet', 'vagon']
  },
  {
    id: 'severed-arm',
    titleTr: 'Postadaki Kesik Kol',
    titleEn: 'Severed Arm in Mail',
    difficulty: 'Zor',
    difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    promptTr: 'Doktor postayla gelen kesik insan kolunu inceler, onaylar ve denize atar. Neden?',
    promptEn: 'A doctor inspects a mailed severed arm, approves it, and throws it in the ocean. Why?',
    fullStoryTr: '4 arkadaş ıssız adada açlıktan ölmemek için sırayla birer kolunu feda etmeyi kabul etti. Kurtarıldıktan sonra son arkadaşı yeminini tutup kolunu doktora postaladı.',
    fullStoryEn: '4 friends agreed to eat one arm each to survive on an island. After rescue, the last man mailed his severed arm to prove he kept the promise.',
    hintsTr: ['Geçmişte adada verilen bir yemin vardı.', 'Hayatta kalmak için organ feda ettiler.'],
    hintsEn: ['A pact was made on an island.', 'Sacrificed limbs to survive.'],
    keyFacts: ['ada', 'yemin', 'kol', 'uzuv', 'doktor', 'açlık'],
    rules: [
      { keywords: ['doktorun kendi kolu', 'doktorun kolu'], answer: 'Hayır' },
      { keywords: ['cinayet', 'katil', 'murder'], answer: 'Hayır' },
      { keywords: ['ada', 'ıssız ada', 'kazazede', 'island', 'shipwreck'], answer: 'Evet' },
      { keywords: ['açlık', 'aç kalmak', 'starve', 'yedi'], answer: 'Evet' },
      { keywords: ['yemin', 'söz', 'anlaşma', 'pact', 'promise'], answer: 'Evet' },
      { keywords: ['kol', 'uzuv', 'kesik kol', 'arm', 'severed'], answer: 'Evet' },
      { keywords: ['doktor arkadaş', 'arkadaş'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['kargo şirketi']
  },
  {
    id: 'poisoned-ice',
    titleTr: 'Zehirli Buz Küpleri',
    titleEn: 'Poisoned Ice Cubes',
    difficulty: 'Orta',
    difficultyColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    promptTr: 'İki adam aynı zehirli içecekten sipariş eder. Hızlı içen yaşar, yavaş içen ölür. Neden?',
    promptEn: 'Two men order poisoned drinks. Fast drinker lives, slow drinker dies. Why?',
    fullStoryTr: 'Zehir buz küplerinin içindeydi. Hızlı içen buz erimeden bitirdi, yavaş içende buz eriyip zehir karıştı.',
    fullStoryEn: 'Poison was in the ice. The fast drinker finished before ice melted.',
    hintsTr: ['Zehir buzun içindeydi.', 'Buz zamanla eridi.'],
    hintsEn: ['Poison was in the ice.', 'Ice melted over time.'],
    keyFacts: ['buz', 'zehir', 'eridi', 'içecek', 'hızlı'],
    rules: [
      { keywords: ['sıvı zehirli', 'içeceğin kendisi', 'sıvıda zehir', 'poison in liquid'], answer: 'Hayır' },
      { keywords: ['panzehir', 'antidote'], answer: 'Hayır' },
      { keywords: ['bardaklar farklı', 'farklı içecek'], answer: 'Hayır' },
      { keywords: ['buz', 'ice', 'buz küpü', 'buzda zehir', 'zehirli buz'], answer: 'Evet' },
      { keywords: ['eridi', 'erime', 'melt'], answer: 'Evet' },
      { keywords: ['hızlı içen', 'hızlı', 'fast'], answer: 'Evet' },
      { keywords: ['zehir', 'poison'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['bardak türü']
  },
  {
    id: 'push-car',
    titleTr: 'Arabayı Otel Önüne İten Adam',
    titleEn: 'Pushing Car to Hotel',
    difficulty: 'Kolay',
    difficultyColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    promptTr: 'Bir adam arabasını bir otelin önüne iter ve aniden iflas ettiğini anlar. Neden?',
    promptEn: 'A man pushes his car to a hotel and realizes he is bankrupt. Why?',
    fullStoryTr: 'Adam Monopoly oyunu oynamaktadır. Arabası otel olan bir kareye gelmiştir ve otel kirasını ödeyemeyeceği için iflas eder.',
    fullStoryEn: 'He is playing Monopoly. His car piece landed on a hotel square and he can\'t afford rent.',
    hintsTr: ['Bu gerçek bir araba değil.', 'Bir masa oyunudur.'],
    hintsEn: ['Not a real car.', 'It\'s a board game.'],
    keyFacts: ['monopoly', 'oyun', 'piyon', 'otel', 'iflas'],
    rules: [
      { keywords: ['gerçek araba', 'gerçek otomobil', 'real car'], answer: 'Hayır' },
      { keywords: ['gerçek otel', 'real hotel'], answer: 'Hayır' },
      { keywords: ['trafik kazası', 'kaza', 'crash'], answer: 'Hayır' },
      { keywords: ['monopoly', 'kutu oyunu', 'masa oyunu', 'board game', 'oyun', 'game'], answer: 'Evet' },
      { keywords: ['piyon', 'oyuncak araba', 'token', 'piece'], answer: 'Evet' },
      { keywords: ['otel', 'kira', 'hotel', 'rent', 'iflas', 'bankrupt'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['otel adı']
  },
  {
    id: 'apple-shoot',
    titleTr: 'Okçu ve Elma',
    titleEn: 'The Archer and Apple',
    difficulty: 'Kolay',
    difficultyColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    promptTr: 'Bir okçu adamın başındaki elmayı vuramaz, oku adama isabet ettirir. Vurulan adam "Teşekkür ederim" der. Neden?',
    promptEn: 'An archer misses the apple and hits the man instead. The man says "Thank you". Why?',
    fullStoryTr: 'Adam zehirli bir yılan tarafından ısırılmıştı, ok zehirli bölgeyi kanatarak zehri dışarı çıkardı.',
    fullStoryEn: 'The man was bitten by a snake, the arrow drained the venom.',
    hintsTr: [
      'Adamın vücudunda başka bir tehlike vardı.',
      'Ok bir tedavi veya kurtarma işlevi gördü.',
      'Zehri vücuttan bir şeyin akıtması gerekiyordu.'
    ],
    hintsEn: [
      'There was another danger in the man\'s body.',
      'The arrow served as a cure or rescue.',
      'Something needed to drain the venom.'
    ],
    keyFacts: ['yılan', 'zehir', 'ok', 'isabet', 'kurtuldu', 'elma'],
    rules: [
      // 1. SPECIFIC NEGATIVES (HAYIR)
      {
        keywords: [
          'ok zehirli', 'zehirli ok', 'okta zehir', 'oka zehir', 'zehirli bir ok', 'ok mu zehirli',
          'arrow poisoned', 'poisoned arrow', 'poison on arrow', 'poison in arrow'
        ],
        answer: 'Hayır'
      },
      {
        keywords: [
          'elmayı vurdu', 'elmaya isabet', 'elma vuruldu', 'elmayı vurdu mu', 'elmayı vurabildi mi',
          'hit apple', 'shot apple', 'hit the apple'
        ],
        answer: 'Hayır'
      },
      {
        keywords: [
          'bilerek mi', 'kasıtlı mı', 'isteyerek mi', 'planlı mı', 'okçu katil mi', 'cinayet mi', 'düşman mı',
          'on purpose', 'deliberate', 'intentional', 'murder'
        ],
        answer: 'Hayır'
      },
      {
        keywords: [
          'elma zehirli', 'elmada zehir', 'zehirli elma', 'poisoned apple'
        ],
        answer: 'Hayır'
      },
      {
        keywords: [
          'okçu mu zehirli', 'okçuda zehir'
        ],
        answer: 'Hayır'
      },
      {
        keywords: [
          'adam öldü mü', 'öldü mü', 'adam ölüyor mu', 'did he die'
        ],
        answer: 'Hayır'
      },

      // 2. SPECIFIC POSITIVES (EVET)
      {
        keywords: [
          'ok adama', 'adama isabet', 'isabet etti mi', 'isabet etti', 'adamı vurdu', 'adama çarptı',
          'adama saplandı', 'adama battı', 'adama değdi', 'adam vuruldu', 'vurulan adam', 'vurdu mu',
          'arrow hit', 'hit the man', 'shot the man', 'struck the man'
        ],
        answer: 'Evet'
      },
      {
        keywords: [
          'adam zehir', 'adamda zehir', 'adam zehirlen', 'zehirlendi mi', 'zehirlenmiş mi', 'vücudunda zehir',
          'man poisoned', 'was he poisoned', 'poison in man'
        ],
        answer: 'Evet'
      },
      {
        keywords: [
          'yılan', 'snake', 'ısırık', 'ısır', 'soktu', 'bitten'
        ],
        answer: 'Evet'
      },
      {
        keywords: [
          'zehir dışarı', 'dışarı çıktı', 'zehir aktı', 'zehri akıttı', 'zehir çıktı', 'kanattı',
          'kurtardı', 'kurtuldu', 'panzehir', 'tedavi', 'iyileşti', 'hayatı kurtuldu',
          'drained', 'saved', 'survived', 'cured'
        ],
        answer: 'Evet'
      },
      {
        keywords: [
          'teşekkür', 'minnet', 'thank'
        ],
        answer: 'Evet'
      },
      {
        keywords: [
          'başında elma', 'kafada elma', 'elma var mıydı', 'apple on head'
        ],
        answer: 'Evet'
      }
    ],
    irrelevantKeywords: ['ok rengi', 'okçu adı', 'elma cinsi', 'elma türü', 'yay markası']
  },
  {
    id: 'submarine-hat',
    titleTr: 'Denizaltındaki Şapka',
    titleEn: 'Submarine Hat',
    difficulty: 'Orta',
    difficultyColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    promptTr: 'Batmakta olan denizaltıdan su yüzeyine sadece bir şapka çıkar. Denizciler kurtulur. Neden?',
    promptEn: 'Only a hat floats up from sinking submarine, crew is saved. Why?',
    fullStoryTr: 'Şapka torpido kovanından yukarı fırlatılmış acil durum haberleşme şamandırasıydı.',
    fullStoryEn: 'The hat was attached to an emergency buoy sent up torpedo tube.',
    hintsTr: ['Şapka bir sinyal aracıydı.'],
    hintsEn: ['Hat was a signal buoy.'],
    keyFacts: ['şamandıra', 'sinyal', 'denizaltı', 'kurtul', 'torpido'],
    rules: [
      { keywords: ['kafada mıydı', 'insan kafası', 'yüzdü'], answer: 'Hayır' },
      { keywords: ['patladı', 'bomba'], answer: 'Hayır' },
      { keywords: ['şamandıra', 'sinyal', 'işaret', 'haberleşme', 'buoy', 'signal'], answer: 'Evet' },
      { keywords: ['torpido', 'fırlattı', 'tube'], answer: 'Evet' },
      { keywords: ['denizaltı', 'battı', 'submarine', 'sinking'], answer: 'Evet' },
      { keywords: ['kurtul', 'kurtarıldı', 'saved', 'survive'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['deniz adı']
  },
  {
    id: 'fatal-photo',
    titleTr: 'Son Fotoğraf',
    titleEn: 'Fatal Photograph',
    difficulty: 'Orta',
    difficultyColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    promptTr: 'Uçurum kenarında karısının fotoğrafını çeken adam, fotoğraf banyosundan sonra polise teslim olur. Neden?',
    promptEn: 'Man takes photo of wife on cliff, sees developed photo and surrenders to police. Why?',
    fullStoryTr: 'Fotoğrafta karısını arkasından kimin ittiğinin gölgesi görünüyordu.',
    fullStoryEn: 'The photo captured the shadow of the person who pushed her.',
    hintsTr: ['Fotoğraf bir kanıt ortaya çıkardı.'],
    hintsEn: ['Photo revealed evidence.'],
    keyFacts: ['gölge', 'itme', 'kanıt', 'fotoğraf', 'cinayet'],
    rules: [
      { keywords: ['adam mı itti', 'kocası mı itti', 'adam mı öldürdü'], answer: 'Hayır' },
      { keywords: ['fotoğraf sahte', 'montaj'], answer: 'Hayır' },
      { keywords: ['itildi', 'biri mi itti', 'başkası mı itti', 'pushed'], answer: 'Evet' },
      { keywords: ['gölge', 'shadow'], answer: 'Evet' },
      { keywords: ['kanıt', 'ipucu', 'delil', 'evidence', 'proof'], answer: 'Evet' },
      { keywords: ['uçurum', 'cliff', 'fotoğraf', 'photo'], answer: 'Evet' },
      { keywords: ['öldü', 'katil', 'cinayet', 'murder'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['kamera markası']
  },
  {
    id: 'wooden-plank',
    titleTr: 'Nehirdeki Tahta',
    titleEn: 'Wooden Plank in River',
    difficulty: 'Kolay',
    difficultyColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    promptTr: 'İki adam tek kişilik bir tahta parçasıyla nehri geçer ve ikisi de ıslanmadan karşıya ulaşır. Nasıl?',
    promptEn: 'Two men cross a river on a one-man plank and both reach dry. How?',
    fullStoryTr: 'İki adam nehrin karşı kıyılarındaydı, tahtayı sırayla kullandılar.',
    fullStoryEn: 'They were on opposite sides of the river.',
    hintsTr: ['Aynı taraftan başlamadılar.'],
    hintsEn: ['They started on opposite sides.'],
    keyFacts: ['karşı', 'kıyı', 'nehir', 'sırayla', 'tahta'],
    rules: [
      { keywords: ['aynı kıyı', 'aynı taraf', 'same side'], answer: 'Hayır' },
      { keywords: ['aynı anda', 'birlikte bindiler', 'together'], answer: 'Hayır' },
      { keywords: ['yüzdüler', 'köprü'], answer: 'Hayır' },
      { keywords: ['karşı', 'karşı kıyı', 'farklı kıyı', 'opposite side', 'opposite'], answer: 'Evet' },
      { keywords: ['sırayla', 'sırayla kullandılar', 'one by one', 'turn'], answer: 'Evet' },
      { keywords: ['nehir', 'tahta', 'river', 'plank'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['nehir adı']
  },
  {
    id: 'midnight-caller',
    titleTr: 'Gece Yarısı Telefonu',
    titleEn: 'Midnight Caller',
    difficulty: 'Zor',
    difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    promptTr: 'Adam kendi evini arar, hat meşgul çalınca intihar eder. Neden?',
    promptEn: 'Man calls his own house, hears busy signal, shoots himself. Why?',
    fullStoryTr: 'Adam evine bombalı tuzak kurmuştu ve telefon çalınca bomba patlayacaktı. Hat meşgulse bomba patlamış demekti.',
    fullStoryEn: 'He rigged a phone-triggered bomb at home. Busy signal meant it detonated.',
    hintsTr: ['Evde bir tuzak kurmuştu.'],
    hintsEn: ['He set a trap at home.'],
    keyFacts: ['bomba', 'tuzak', 'telefon', 'meşgul', 'patla'],
    rules: [
      { keywords: ['aldatma', 'sevgili', 'başkasıyla'], answer: 'Hayır' },
      { keywords: ['hırsız', 'thief'], answer: 'Hayır' },
      { keywords: ['telefon bozuk', 'arıza'], answer: 'Hayır' },
      { keywords: ['bomba', 'tuzak', 'düzenek', 'bomb', 'trap'], answer: 'Evet' },
      { keywords: ['patla', 'patladı', 'patlayacak', 'explode', 'detonate'], answer: 'Evet' },
      { keywords: ['telefon', 'hat', 'meşgul', 'busy signal', 'call'], answer: 'Evet' },
      { keywords: ['intihar', 'suicide'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['telefon numarası']
  },
  {
    id: 'blind-waiter',
    titleTr: 'Garson ve Düşen Bardak',
    titleEn: 'The Dropped Glass',
    difficulty: 'Kolay',
    difficultyColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    promptTr: 'Garson kaza ile bardağı düşürüp kırar. Masadaki kör adam hiç tepki vermez ama bardağın kırıldığını bilir. Nasıl?',
    promptEn: 'Waiter drops a glass. Blind man doesn\'t flinch but knows it broke. How?',
    fullStoryTr: 'Kör adam bardağın kırılma sesini duymuştur.',
    fullStoryEn: 'He heard the sound of breaking glass.',
    hintsTr: ['İşitme duyusu sağlamdı.'],
    hintsEn: ['His hearing worked fine.'],
    keyFacts: ['duydu', 'ses', 'kör', 'bardak', 'kırıl'],
    rules: [
      { keywords: ['gördü', 'görüyor muydu', 'saw'], answer: 'Hayır' },
      { keywords: ['söyledi', 'biri mi dedi', 'told him'], answer: 'Hayır' },
      { keywords: ['çarptı', 'dokundu'], answer: 'Hayır' },
      { keywords: ['kör', 'gözleri görmüyor', 'blind'], answer: 'Evet' },
      { keywords: ['duydu', 'işitti', 'heard'], answer: 'Evet' },
      { keywords: ['ses', 'kırılma sesi', 'sound', 'noise'], answer: 'Evet' },
      { keywords: ['bardak', 'kırıldı', 'glass', 'broke'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['bardak rengi']
  },
  {
    id: 'radio-dj',
    titleTr: 'Gece Yarısı Radyosu',
    titleEn: 'Midnight Radio DJ',
    difficulty: 'Zor',
    difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    promptTr: 'Radyo sunucusu arabasında canlı yayınını dinlerken yayını kapatır ve intihar eder. Neden?',
    promptEn: 'A radio host listens to his live broadcast in his car, turns off radio and shoots himself. Why?',
    fullStoryTr: 'Sunucu karısını öldürüp alibi yapmak için radyoda önceden kaydettiği bandı yayına vermişti. Arabada kayıttaki duraklama hatasını fark edince alibisiz kaldığını anlayıp intihar etti.',
    fullStoryEn: 'He killed his wife and set a tape to play live on radio for an alibi. Hearing a glitch on air, he knew his alibi was ruined.',
    hintsTr: ['Yayın canlı değildi, banttı.', 'Cinayet işlemişti.'],
    hintsEn: ['Broadcast was pre-recorded.', 'He committed a murder.'],
    keyFacts: ['bant', 'kayıt', 'alibi', 'cinayet', 'radyo'],
    rules: [
      { keywords: ['canlı yayın', 'o an stüdyoda', 'live'], answer: 'Hayır' },
      { keywords: ['kovuldu', 'istifa'], answer: 'Hayır' },
      { keywords: ['karısı', 'öldürdü', 'cinayet', 'killed wife', 'murder'], answer: 'Evet' },
      { keywords: ['kayıt', 'bant', 'kaset', 'önceden kayıt', 'tape', 'recorded'], answer: 'Evet' },
      { keywords: ['alibi', 'kanıt', 'delil'], answer: 'Evet' },
      { keywords: ['hata', 'duraklama', 'glitch', 'error'], answer: 'Evet' },
      { keywords: ['intihar', 'suicide'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['frekans']
  },
  {
    id: 'circus-tightrope',
    titleTr: 'Müzik Durduğunda',
    titleEn: 'When Music Stopped',
    difficulty: 'Zor',
    difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    promptTr: 'Gözleri bağlı sirk cambazı müzik durunca ipten aşağı atlar ve ölür. Neden?',
    promptEn: 'A blindfolded tightrope walker jumps off when music stops and dies. Why?',
    fullStoryTr: 'Cambaz gösteride ipin sonuna geldiğini anlamak için müziğin bitmesini işaret alıyordu. Ancak orkestra şefi aniden kalp krizi geçirip müziği erken kesince cambaz boşluğa atladı.',
    fullStoryEn: 'He used music timing to know when he reached the end platform. Music stopped early due to conductor\'s heart attack.',
    hintsTr: ['Müzik ona ipin bittiğini haber veriyordu.', 'Müzik erken kesildi.'],
    hintsEn: ['Music signalled the end.', 'Music stopped early.'],
    keyFacts: ['sirk', 'müzik', 'erken', 'cambaz', 'işaret', 'şef'],
    rules: [
      { keywords: ['ip koptu', 'ip kırıldı'], answer: 'Hayır' },
      { keywords: ['intihar etmek istedi', 'kasıtlı atladı'], answer: 'Hayır' },
      { keywords: ['gözleri bağlı', 'kör', 'blindfolded'], answer: 'Evet' },
      { keywords: ['müzik', 'music', 'işaret', 'signal'], answer: 'Evet' },
      { keywords: ['erken bitti', 'erken kesildi', 'stopped early'], answer: 'Evet' },
      { keywords: ['kalp krizi', 'şef', 'bayıldı', 'heart attack'], answer: 'Evet' },
      { keywords: ['cambaz', 'atladı', 'düştü', 'jumped'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['sirk adı']
  },
  {
    id: 'twin-doctors',
    titleTr: 'Ameliyattaki Cerrah',
    titleEn: 'The Surgeon',
    difficulty: 'Kolay',
    difficultyColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    promptTr: 'Bir çocuk kazadan sonra ameliyata alınır. Cerrah "Ben bunu ameliyat edemem, bu benim oğlum" der. Ancak cerrah çocuğun babası değildir. Cerrah kimdir?',
    promptEn: 'A boy is rushed to surgery. The surgeon says "I can\'t operate, he is my son!" but the surgeon is not his father. Who is surgeon?',
    fullStoryTr: 'Cerrah çocuğun annesidir.',
    fullStoryEn: 'The surgeon is the boy\'s mother.',
    hintsTr: ['Ebeveyn ilişkisini düşünün.'],
    hintsEn: ['Think about parental roles.'],
    keyFacts: ['anne', 'annesi', 'kadın', 'doktor', 'ameliyat'],
    rules: [
      { keywords: ['baba', 'üvey baba', 'father', 'stepfather'], answer: 'Hayır' },
      { keywords: ['erkek', 'dede', 'amca', 'dayı'], answer: 'Hayır' },
      { keywords: ['anne', 'annesi', 'öz annesi', 'mother', 'mom'], answer: 'Evet' },
      { keywords: ['kadın', 'bayan', 'woman', 'female'], answer: 'Evet' },
      { keywords: ['doktor', 'cerrah', 'surgeon'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['hastane adı']
  },
  {
    id: 'silent-library',
    titleTr: 'Kütüphanedeki Not',
    titleEn: 'Note in Library',
    difficulty: 'Orta',
    difficultyColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    promptTr: 'Kütüphanede kitap okuyan bir adam, sayfa arasındaki bir notu okuyunca koşarak dışarı çıkar ve bir hayat kurtarır. Neden?',
    promptEn: 'A man reading a book in a library finds a note, rushes out and saves a life. Why?',
    fullStoryTr: 'Not bir intihar mektubuydu ve yerini tarif ediyordu.',
    fullStoryEn: 'The note was a suicide letter giving location.',
    hintsTr: ['Not bir yardım çağrısıydı.'],
    hintsEn: ['The note was a cry for help.'],
    keyFacts: ['intihar', 'not', 'mektup', 'kurtardı', 'kütüphane'],
    rules: [
      { keywords: ['şaka', 'joke'], answer: 'Hayır' },
      { keywords: ['kendi intiharı', 'kendini mi öldürdü'], answer: 'Hayır' },
      { keywords: ['kitap yazarı', 'yazar'], answer: 'Hayır' },
      { keywords: ['intihar', 'intihar notu', 'intihar mektubu', 'suicide', 'letter'], answer: 'Evet' },
      { keywords: ['yardım çağrısı', 'not', 'mektup', 'help', 'note'], answer: 'Evet' },
      { keywords: ['kurtardı', 'hayat kurtardı', 'saved', 'rescue'], answer: 'Evet' },
      { keywords: ['konum', 'adres', 'yer', 'location'], answer: 'Evet' }
    ],
    irrelevantKeywords: ['kitap adı']
  }
];
