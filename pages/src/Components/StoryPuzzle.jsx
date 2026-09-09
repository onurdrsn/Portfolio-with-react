import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import axios from 'axios';
import { 
  BrainCircuit, 
  HelpCircle, 
  Send, 
  RotateCcw, 
  Lightbulb, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  Clock,
  BookOpen,
  Award,
  Eye,
  Info,
  Flame,
  Bot,
  Zap,
  Loader2,
  Search,
  X,
  Grid,
  Play
} from 'lucide-react';

const WORKER_URL = 'https://portfolio-worker.onurd.com.tr';

// Expanded Library of 20 Lateral Thinking Puzzles
const STORIES = [
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
      { keywords: ['kazada mı', 'kazada gözlerini', 'sonradan mı', 'kazada kör', 'gözlerini mi kaybetti'], answer: 'Evet' },
      { keywords: ['uçak', 'kaza', 'düştü', 'plane', 'crash'], answer: 'Evet' },
      { keywords: ['karısı', 'kadın', 'öldü mü', 'wife', 'dead'], answer: 'Evet' },
      { keywords: ['adam mı öldürdü', 'cinayet', 'murder'], answer: 'Hayır' },
      { keywords: ['adadaki et', 'martı eti miydi', 'is seagull'], answer: 'Hayır' },
      { keywords: ['insan eti', 'kendi eti', 'karısının eti', 'uzuv', 'human flesh'], answer: 'Evet' },
      { keywords: ['lokantadaki et', 'restorant', 'restaurant'], answer: 'Evet' },
      { keywords: ['intihar', 'suicide'], answer: 'Evet' }
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
      { keywords: ['cüce', 'boyu kısa', 'dwarf', 'short'], answer: 'Evet' },
      { keywords: ['düğme', 'düğmeye yetişmiyor', 'button'], answer: 'Evet' },
      { keywords: ['şemsiye', 'umbrella'], answer: 'Evet' },
      { keywords: ['spor', 'egzersiz', 'exercise'], answer: 'Hayır' }
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
      { keywords: ['hıçkırık', 'hiccup'], answer: 'Evet' },
      { keywords: ['korkutmak', 'scare'], answer: 'Evet' },
      { keywords: ['düşman', 'borç', 'enemy'], answer: 'Hayır' }
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
    keyFacts: ['balon', 'sıcak hava balonu', 'düştü', 'kura', 'kibrit'],
    rules: [
      { keywords: ['balon', 'balloon'], answer: 'Evet' },
      { keywords: ['düştü', 'fall'], answer: 'Evet' },
      { keywords: ['kura', 'draw'], answer: 'Evet' }
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
      { keywords: ['fener', 'deniz feneri', 'lighthouse'], answer: 'Evet' },
      { keywords: ['gemi', 'kaza', 'ship', 'crash'], answer: 'Evet' },
      { keywords: ['gazete', 'haber', 'newspaper'], answer: 'Evet' }
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
    keyFacts: ['buz', 'eridi', 'su'],
    rules: [{ keywords: ['buz', 'ice'], answer: 'Evet' }, { keywords: ['eridi', 'melt'], answer: 'Evet' }],
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
    keyFacts: ['tünel', 'karanlık', 'ameliyat'],
    rules: [{ keywords: ['tünel', 'tunnel'], answer: 'Evet' }, { keywords: ['karanlık', 'dark'], answer: 'Evet' }],
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
    keyFacts: ['ada', 'yemin', 'kol'],
    rules: [{ keywords: ['ada', 'shipwreck'], answer: 'Evet' }, { keywords: ['yemin', 'pact'], answer: 'Evet' }],
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
    keyFacts: ['buz', 'eridi'],
    rules: [{ keywords: ['buz', 'ice'], answer: 'Evet' }, { keywords: ['eridi', 'melt'], answer: 'Evet' }],
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
    keyFacts: ['monopoly', 'oyun', 'piyon'],
    rules: [{ keywords: ['monopoly', 'oyun'], answer: 'Evet' }],
    irrelevantKeywords: ['otel adı']
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
    keyFacts: ['bant', 'kayıt', 'alibi', 'cinayet'],
    rules: [{ keywords: ['kayıt', 'tape'], answer: 'Evet' }, { keywords: ['alibi', 'cinayet'], answer: 'Evet' }],
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
    keyFacts: ['sirk', 'müzik', 'erken'],
    rules: [{ keywords: ['müzik', 'music'], answer: 'Evet' }],
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
    keyFacts: ['anne', 'annesi'],
    rules: [{ keywords: ['anne', 'mother'], answer: 'Evet' }],
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
    keyFacts: ['intihar', 'not', 'mektup'],
    rules: [{ keywords: ['intihar', 'suicide'], answer: 'Evet' }],
    irrelevantKeywords: ['kitap adı']
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
    hintsTr: ['Adamın vücudunda başka bir tehlike vardı.'],
    hintsEn: ['There was another danger.'],
    keyFacts: ['yılan', 'zehir'],
    rules: [{ keywords: ['yılan', 'zehir'], answer: 'Evet' }],
    irrelevantKeywords: ['ok rengi']
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
    keyFacts: ['şamandıra', 'sinyal'],
    rules: [{ keywords: ['sinyal', 'buoy'], answer: 'Evet' }],
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
    keyFacts: ['gölge', 'itme', 'kanıt'],
    rules: [{ keywords: ['gölge', 'shadow'], answer: 'Evet' }],
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
    keyFacts: ['karşı', 'kıyı'],
    rules: [{ keywords: ['karşı', 'opposite'], answer: 'Evet' }],
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
    keyFacts: ['bomba', 'tuzak'],
    rules: [{ keywords: ['bomba', 'bomb'], answer: 'Evet' }],
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
    keyFacts: ['duydu', 'ses'],
    rules: [{ keywords: ['duydu', 'sound'], answer: 'Evet' }],
    irrelevantKeywords: ['bardak rengi']
  }
];

// Deterministic daily story index calculator (No cronjob)
const getDailyStoryIndex = (total) => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % total;
};

export default function StoryPuzzle() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'tr';
  const isTr = currentLang.startsWith('tr');

  const [storyPool, setStoryPool] = useState(STORIES);
  const dailyIndex = getDailyStoryIndex(storyPool.length);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(dailyIndex);
  
  // Modals & Drawers
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('Tümü');

  const [useCloudflareAi, setUseCloudflareAi] = useState(false);
  const [generatingAiStory, setGeneratingAiStory] = useState(false);

  const story = storyPool[selectedStoryIndex] || STORIES[0];

  const [questionInput, setQuestionInput] = useState('');
  const [chatLogs, setChatLogs] = useState([]);
  const [isThinking, setIsThinking] = useState(false); // Typing indicator state
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [guessModalOpen, setGuessModalOpen] = useState(false);
  const [guessInput, setGuessInput] = useState('');
  const [guessFeedback, setGuessFeedback] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [showFullAnswer, setShowFullAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const chatEndRef = useRef(null);

  // Daily Countdown Timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow - now;

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat log
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs, isThinking]);

  const handleSelectStory = (index) => {
    setSelectedStoryIndex(index);
    setLibraryModalOpen(false);
    setChatLogs([]);
    setHintsRevealed(0);
    setGuessInput('');
    setGuessFeedback(null);
    setIsSolved(false);
    setShowFullAnswer(false);
  };

  // Generate new story with Cloudflare Workers AI
  const handleGenerateAiStory = async () => {
    setGeneratingAiStory(true);
    try {
      const res = await axios.post(`${WORKER_URL}/api/ai/story-generate`);
      if (res.data?.story) {
        const newAiStory = {
          id: `cf-ai-${Date.now()}`,
          ...res.data.story,
          difficultyColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
          rules: [],
          irrelevantKeywords: []
        };
        setStoryPool(prev => [newAiStory, ...prev]);
        setSelectedStoryIndex(0);
        setLibraryModalOpen(false);
        setChatLogs([]);
        setHintsRevealed(0);
        setIsSolved(false);
        setShowFullAnswer(false);
        setUseCloudflareAi(true);
      }
    } catch (err) {
      console.error('Failed to generate story with Workers AI:', err);
    } finally {
      setGeneratingAiStory(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    const query = questionInput.trim();
    if (!query || isThinking) return;

    // Instantly append User's Question to Chat Log
    const userLog = {
      id: Date.now(),
      type: 'user',
      question: query
    };
    setChatLogs(prev => [...prev, userLog]);
    setQuestionInput('');
    setIsThinking(true); // Show 3-dot typing animation

    if (useCloudflareAi) {
      // Cloudflare Workers AI Evaluation
      try {
        const res = await axios.post(`${WORKER_URL}/api/ai/story-evaluate`, {
          story,
          question: query
        });

        const data = res.data;
        
        // STRICT ANSWER FORMATTING (No Spoilers on HAYIR or EVET!)
        let finalAnswer = data.answer || 'EVET';
        let finalExplanation = '';

        if (finalAnswer.includes('HAYIR') || finalAnswer.includes('NO')) {
          finalAnswer = isTr ? 'HAYIR' : 'NO';
          finalExplanation = ''; // NEVER output extra text on HAYIR!
        } else if (finalAnswer.includes('EVET') || finalAnswer.includes('YES')) {
          finalAnswer = isTr ? 'EVET' : 'YES';
          finalExplanation = ''; // NEVER output extra text on EVET!
        } else if (finalAnswer.includes('Önemsiz') || finalAnswer.includes('Alakasız')) {
          finalAnswer = isTr ? 'Önemsiz' : 'Irrelevant';
          finalExplanation = '';
        } else if (data.status === 'warning' || finalAnswer.includes('UYARI')) {
          finalAnswer = isTr ? '⚠️ UYARI: Soru Şekli Geçersiz' : '⚠️ WARNING: Invalid Format';
          finalExplanation = isTr 
            ? 'Lütfen sadece "Evet" veya "Hayır" cevabı verilebilecek sorular sorun!' 
            : 'Please ask questions that can only be answered with Yes or No!';
        }

        setTimeout(() => {
          setChatLogs(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              type: 'ai',
              status: data.status || 'valid',
              answer: finalAnswer,
              explanation: finalExplanation
            }
          ]);
          setIsThinking(false);
        }, 600);

      } catch (err) {
        console.error('Cloudflare Workers AI evaluation failed, falling back to local engine:', err);
        evaluateLocally(query);
      }
    } else {
      // Local Engine Evaluation with simulated thinking delay
      setTimeout(() => {
        evaluateLocally(query);
      }, 700);
    }
  };

  const evaluateLocally = (query) => {
    const lowerQuery = query.toLowerCase();

    // Open-ended question check
    const openEndedWords = [
      'neden', 'niçin', 'nasıl', 'kim', 'kimin', 'ne zaman', 'nerede', 'nereden', 'ne kadar', 'kaç', 'hangi',
      'why', 'how', 'who', 'where', 'when', 'what'
    ];

    const isQuestionMark = query.endsWith('?');
    const startsWithOpenEnded = openEndedWords.some(word => lowerQuery.startsWith(word) || lowerQuery.includes(` ${word} `));
    
    const yesNoSuffixes = ['mi', 'mı', 'mu', 'mü', 'miydi', 'mıydı', 'muydum', 'müdür', 'midir', 'mıdır', 'var mı', 'yok mu', 'oldu mu', 'kaldı mı', 'ettimi', 'etti mi'];
    const hasYesNoSuffix = yesNoSuffixes.some(suf => lowerQuery.includes(suf));

    let status = 'valid';
    let answerText = 'EVET';
    let explanation = '';

    if (startsWithOpenEnded || (!hasYesNoSuffix && !isQuestionMark && !lowerQuery.includes('is') && !lowerQuery.includes('was') && !lowerQuery.includes('did'))) {
      status = 'warning';
      answerText = isTr ? '⚠️ UYARI: Soru Şekli Geçersiz' : '⚠️ WARNING: Invalid Format';
      explanation = isTr 
        ? 'Lütfen sadece "Evet" veya "Hayır" cevabı verilebilecek sorular sorun! (Örnek: "Adam kör müydü?", "Karısı öldü mü?")'
        : 'Please ask questions that can only be answered with "Yes" or "No"!';
    } else {
      const isIrrelevant = (story.irrelevantKeywords || []).some(kw => lowerQuery.includes(kw));
      if (isIrrelevant) {
        status = 'irrelevant';
        answerText = isTr ? 'Önemsiz' : 'Irrelevant';
        explanation = '';
      } else {
        let matchedRule = (story.rules || []).find(rule => 
          rule.keywords.some(kw => lowerQuery.includes(kw))
        );

        if (matchedRule) {
          answerText = matchedRule.answer === 'Evet' 
            ? (isTr ? 'EVET' : 'YES') 
            : (isTr ? 'HAYIR' : 'NO');
          explanation = ''; // STRICTLY NO EXTRA EXPLANATION!
        } else {
          // Specific rule check for "doğuştan" to avoid wrong fallback matches
          if (lowerQuery.includes('doğuştan')) {
            answerText = isTr ? 'HAYIR' : 'NO';
            explanation = '';
          } else {
            const factMatch = (story.keyFacts || []).some(fact => lowerQuery.includes(fact));
            if (factMatch) {
              answerText = isTr ? 'EVET' : 'YES';
            } else {
              answerText = isTr ? 'HAYIR' : 'NO';
            }
            explanation = '';
          }
        }
      }
    }

    setChatLogs(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        type: 'ai',
        status,
        answer: answerText,
        explanation
      }
    ]);
    setIsThinking(false);
  };

  const handleRevealHint = () => {
    const hintsList = isTr ? story.hintsTr : story.hintsEn;
    if (hintsRevealed < hintsList.length) {
      setHintsRevealed(prev => prev + 1);
    }
  };

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    const lowerGuess = guessInput.toLowerCase();
    const matchedCount = (story.keyFacts || []).filter(fact => lowerGuess.includes(fact)).length;
    const matchRatio = matchedCount / (story.keyFacts?.length || 1);

    if (matchRatio >= 0.35 || matchedCount >= 2) {
      setIsSolved(true);
      setShowFullAnswer(true);
      setGuessModalOpen(false);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
      setGuessFeedback({
        success: true,
        message: isTr ? 'Tebrikler! Hikayenin ana kurgusunu doğru şekilde çözdünüz!' : 'Congratulations! You successfully solved the main plot!'
      });
    } else {
      setGuessFeedback({
        success: false,
        message: isTr ? 'Henüz tam olarak doğru değil. Birkaç önemli detayı gözden geçirin ve soru sormaya devam edin!' : 'Not quite right yet. Re-evaluate key facts and keep asking questions!'
      });
    }
  };

  // Filtered stories for the Library Explorer
  const filteredStories = storyPool.filter(s => {
    const matchesSearch = (isTr ? s.titleTr : s.titleEn).toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (isTr ? s.promptTr : s.promptEn).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'Tümü' || s.difficulty.includes(difficultyFilter);
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-950 text-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Bar Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/90 backdrop-blur-xl p-4 rounded-2xl border border-gray-800 shadow-2xl">
          <Link to="/games" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-semibold transition-colors text-sm">
            ← {t('games.backToHome') || 'Oyunlara Dön'}
          </Link>
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-600/20 border border-violet-500/30 rounded-xl">
              <BrainCircuit className="w-6 h-6 text-violet-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {isTr ? 'Olay Örgüsü Bulmacası' : 'Story Puzzle (Lateral Thinking)'}
              </h1>
              <p className="text-[11px] text-gray-400">Gizemli Olayı Çöz • Evet / Hayır Dedektif Oyunu</p>
            </div>
          </div>

          {/* Cloudflare AI Mode Toggle & AI Generator Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseCloudflareAi(!useCloudflareAi)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                useCloudflareAi 
                  ? 'bg-violet-600/30 text-violet-300 border-violet-500 shadow-lg shadow-violet-900/30' 
                  : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:text-gray-200'
              }`}
              title="Cloudflare Workers AI (Llama 3) ile soru değerlendir"
            >
              <Bot className="w-4 h-4 text-violet-400" />
              <span className="hidden md:inline">{useCloudflareAi ? 'Cloudflare AI Modu: Açık' : 'Cloudflare AI Modu'}</span>
            </button>

            <button
              onClick={handleGenerateAiStory}
              disabled={generatingAiStory}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-violet-900/40 flex items-center gap-1.5 disabled:opacity-50"
            >
              {generatingAiStory ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Üretiliyor...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Yapay Zeka Olayı Üret</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Top Bar: Daily Featured Story & Library Explorer Trigger */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Daily Auto Story Hero Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-violet-950/60 via-gray-900 to-slate-900 p-5 rounded-2xl border border-violet-500/30 shadow-xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute right-0 top-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl group-hover:bg-violet-600/20 transition-all duration-500"></div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
                  {isTr ? 'Günün Olayı' : 'Daily Mystery'}
                </span>
                <span className="text-xs font-mono text-gray-400 bg-gray-950/60 px-3 py-1 rounded-full border border-gray-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-violet-400" />
                  {isTr ? 'Kalan Süre:' : 'Time Left:'} <span className="text-white font-bold">{timeLeft}</span>
                </span>
              </div>

              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <span>{STORIES[dailyIndex]?.titleTr}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${STORIES[dailyIndex]?.difficultyColor}`}>
                  {STORIES[dailyIndex]?.difficulty}
                </span>
              </h2>
              <p className="text-xs text-gray-300 italic line-clamp-2">
                "{STORIES[dailyIndex]?.promptTr}"
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => handleSelectStory(dailyIndex)}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-violet-900/30 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {isTr ? 'Günün Olayını Oyna' : 'Play Daily Mystery'}
              </button>
            </div>
          </div>

          {/* Premium Library Explorer Trigger Button */}
          <div className="bg-gray-900/80 p-5 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-violet-400" />
                {isTr ? 'Hikaye Kütüphanesi' : 'Story Library'}
              </span>
              <h3 className="text-base font-bold text-white">
                {storyPool.length} {isTr ? 'Özel Mantık Bulmacası' : 'Puzzles'}
              </h3>
              <p className="text-xs text-gray-400">
                {isTr ? 'Kütüphaneyi açıp dilediğiniz olayı seçin veya filtreleyin.' : 'Browse full library and pick any mystery.'}
              </p>
            </div>

            <button
              onClick={() => setLibraryModalOpen(true)}
              className="w-full mt-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-violet-300 font-bold text-xs rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-2 group"
            >
              <BookOpen className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
              {isTr ? 'Kütüphaneyi Aç & Keşfet' : 'Open Story Library'}
            </button>
          </div>

        </div>

        {/* Main Game Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Mystery Scenario Card & Hints */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/20 transition-all duration-500"></div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> {isTr ? 'Aktif Olay Sonu' : 'Active Mystery'}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${story.difficultyColor}`}>
                  {story.difficulty}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-3">
                {isTr ? story.titleTr : story.titleEn}
              </h2>

              <p className="text-gray-300 text-sm leading-relaxed mb-6 bg-gray-950/60 p-4 rounded-xl border border-gray-800/80 italic">
                "{isTr ? story.promptTr : story.promptEn}"
              </p>

              {/* Solved Status or Guess Button */}
              {isSolved ? (
                <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{isTr ? 'Olay Çözüldü!' : 'Puzzle Solved!'}</span>
                  </div>
                  <p className="text-xs text-emerald-200/80">
                    {isTr ? 'Tebrikler, hikayeyi başarıyla buldunuz!' : 'Great job uncovering the mystery!'}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setGuessModalOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  {isTr ? 'Hikayeyi Tahmin Et / Çöz' : 'Solve / Guess Story'}
                </button>
              )}

              {/* Reveal Full Answer Button */}
              <button
                onClick={() => setShowFullAnswer(!showFullAnswer)}
                className="w-full mt-3 py-2 text-xs font-semibold text-gray-400 hover:text-gray-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                {showFullAnswer 
                  ? (isTr ? 'Cevabı Gizle' : 'Hide Answer')
                  : (isTr ? 'Tam Hikayeyi Göster (Teslim Ol)' : 'Reveal Full Story')}
              </button>

              {/* Full Answer Reveal Box */}
              {showFullAnswer && (
                <div className="mt-4 p-4 bg-purple-950/40 border border-purple-800/50 rounded-xl space-y-2 text-xs text-purple-200 animate-fadeIn">
                  <span className="font-bold text-purple-300 block">{isTr ? '📖 Gerçek Hikaye Arka Planı:' : '📖 Full Story Backstory:'}</span>
                  <p className="leading-relaxed">{isTr ? story.fullStoryTr : story.fullStoryEn}</p>
                </div>
              )}
            </div>

            {/* Hints Panel */}
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-5 border border-gray-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Info className="w-4 h-4" /> {isTr ? 'İpuçları' : 'Hints'}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {hintsRevealed} / {(isTr ? story.hintsTr : story.hintsEn).length}
                </span>
              </div>

              <div className="space-y-2.5">
                {(isTr ? story.hintsTr : story.hintsEn).slice(0, hintsRevealed).map((hint, idx) => (
                  <div key={idx} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                    <span className="font-bold text-amber-400">{idx + 1}.</span>
                    <span>{hint}</span>
                  </div>
                ))}

                {hintsRevealed < (isTr ? story.hintsTr : story.hintsEn).length && (
                  <button
                    onClick={handleRevealHint}
                    className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isTr ? 'Yeni İpucu Aç' : 'Unlock Next Hint'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Q&A Chat & Input Console */}
          <div className="lg:col-span-2 flex flex-col bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl h-[600px] overflow-hidden">
            
            {/* Console Header */}
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${useCloudflareAi ? 'bg-violet-400 animate-ping' : 'bg-emerald-400 animate-ping'}`}></div>
                <span className="text-sm font-semibold text-gray-200">
                  {useCloudflareAi ? 'Cloudflare Workers AI Konsolu' : 'Yapay Zeka Soru - Cevap Konsolu'}
                </span>
              </div>
              <span className="text-xs text-gray-400 italic">
                {isTr ? 'Sadece "EVET" veya "HAYIR" verilir (Detay verilmez)' : 'Only "YES" or "NO" given'}
              </span>
            </div>

            {/* Chat History Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {chatLogs.length === 0 && !isThinking ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-3">
                  <HelpCircle className="w-12 h-12 text-gray-700 stroke-[1.5]" />
                  <p className="text-sm">
                    {isTr 
                      ? 'Olay örgüsünü bulmak için soru sormaya başlayın!' 
                      : 'Ask questions to uncover the mystery backstory!'}
                  </p>
                  <div className="text-xs bg-gray-950/80 px-4 py-3 rounded-xl border border-gray-800 max-w-md text-left text-gray-400 space-y-1">
                    <p className="font-semibold text-gray-300">💡 Soru Sorma Kuralları:</p>
                    <p>• "Bir kaza mı oldu?" → <span className="text-emerald-400 font-bold">EVET</span></p>
                    <p>• "Adam doğuştan mı kördü?" → <span className="text-red-400 font-bold">HAYIR</span></p>
                    <p>• "Saat kaçta oldu?" → <span className="text-amber-400 font-bold">Önemsiz</span></p>
                    <p>• "Adam nerede?" → <span className="text-amber-300">⚠️ UCU AÇIK SORU UYARISI</span></p>
                  </div>
                </div>
              ) : (
                <>
                  {chatLogs.map(log => (
                    <div key={log.id} className="space-y-2 animate-fadeIn">
                      {log.type === 'user' ? (
                        /* User Question */
                        <div className="flex justify-end">
                          <div className="bg-violet-600/30 border border-violet-500/30 text-violet-100 text-sm px-4 py-2.5 rounded-2xl rounded-tr-none max-w-[85%] shadow-md">
                            {log.question}
                          </div>
                        </div>
                      ) : (
                        /* AI Response - STRICT FORMAT (NO EXTRA TEXT ON HAYIR OR EVET) */
                        <div className="flex justify-start">
                          <div className={`text-sm px-5 py-3 rounded-2xl rounded-tl-none max-w-[85%] border shadow-md flex flex-col gap-1 ${
                            log.status === 'warning'
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                              : log.status === 'irrelevant'
                              ? 'bg-gray-800/70 border-gray-700 text-gray-300'
                              : log.answer.includes('EVET') || log.answer.includes('YES')
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                              : 'bg-red-500/20 border-red-500/40 text-red-200'
                          }`}>
                            <div className="flex items-center gap-2 font-black tracking-wide text-lg">
                              {log.status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                              <span>{log.answer}</span>
                            </div>
                            {log.explanation && (
                              <p className="text-xs opacity-90 leading-relaxed font-normal">
                                {log.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* 3-Dot Bouncing Typing Indicator Animation */}
                  {isThinking && (
                    <div className="flex justify-start animate-fadeIn">
                      <div className="bg-gray-800/80 border border-gray-700 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleAskQuestion} className="p-4 border-t border-gray-800 bg-gray-950/60 flex gap-2">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                disabled={isThinking}
                placeholder={isTr ? 'Evet/Hayır cevabı verilebilecek bir soru sorun...' : 'Ask a yes/no question...'}
                className="flex-1 bg-gray-900 border border-gray-700 focus:border-violet-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!questionInput.trim() || isThinking}
                className="px-5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-900/30 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Premium Story Library Explorer Modal */}
      {libraryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 bg-gray-950/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-violet-400" />
                  {isTr ? 'Hikaye Kütüphanesi & Olay Havuzu' : 'Story Library & Mystery Pool'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {isTr ? 'Tüm gizemli olayları keşfedin, zorluk derecesine göre filtreleyin.' : 'Explore all mysteries, filter by difficulty.'}
                </p>
              </div>

              <button 
                onClick={() => setLibraryModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="p-4 bg-gray-950/40 border-b border-gray-800/60 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isTr ? 'Hikaye veya anahtar kelime ara...' : 'Search mystery story...'}
                  className="w-full bg-gray-900 border border-gray-800 focus:border-violet-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto">
                {['Tümü', 'Kolay', 'Orta', 'Zor'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      difficultyFilter === diff
                        ? 'bg-violet-600 text-white border-violet-500 shadow-md'
                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Bento Grid Story Cards */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {filteredStories.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-gray-500 space-y-2">
                  <AlertTriangle className="w-8 h-8 mx-auto text-gray-600" />
                  <p className="text-sm">{isTr ? 'Aramanıza uyan hikaye bulunamadı.' : 'No stories found matching your search.'}</p>
                </div>
              ) : (
                filteredStories.map((s, idx) => {
                  const originalIndex = storyPool.findIndex(st => st.id === s.id);
                  const isDaily = originalIndex === dailyIndex;
                  const isSelected = originalIndex === selectedStoryIndex;

                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStory(originalIndex)}
                      className={`group p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-violet-950/40 border-violet-500 shadow-xl shadow-violet-900/20'
                          : 'bg-gray-950/60 border-gray-800/80 hover:border-gray-700 hover:bg-gray-900/80 hover:-translate-y-1'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {isDaily && (
                              <span className="text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Flame className="w-3 h-3 fill-amber-400" />
                                {isTr ? 'Günün Olayı' : 'Daily'}
                              </span>
                            )}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${s.difficultyColor}`}>
                              {s.difficulty}
                            </span>
                          </div>
                          
                          {isSelected && (
                            <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                              {isTr ? 'Seçili' : 'Active'}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors mb-2">
                          {isTr ? s.titleTr : s.titleEn}
                        </h4>

                        <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                          "{isTr ? s.promptTr : s.promptEn}"
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between">
                        <span className="text-[11px] text-gray-500">
                          {s.keyFacts?.length || 0} {isTr ? 'Anahtar İpucu' : 'Key Clues'}
                        </span>

                        <span className="text-xs font-bold text-violet-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          {isTr ? 'Oyna' : 'Play'} →
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-950/60 flex justify-between items-center text-xs text-gray-400">
              <span>Toplam {storyPool.length} Olay Bulunuyor</span>
              <button
                onClick={() => setLibraryModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-xl"
              >
                {isTr ? 'Kapat' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Guess Solution Modal */}
      {guessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                {isTr ? 'Olay Hikayesini Tahmin Et' : 'Guess The Mystery Story'}
              </h3>
              <button 
                onClick={() => setGuessModalOpen(false)}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400">
              {isTr 
                ? 'Olayın arka planında ne olduğunu açıklayın (ör. uçak kazası, kör adam, fedakarlık vs.):' 
                : 'Explain what happened in the backstory (e.g. plane crash, sacrifice, etc.):'}
            </p>

            <form onSubmit={handleGuessSubmit} className="space-y-4">
              <textarea
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                rows={4}
                placeholder={isTr ? 'Hikaye tahmininizi detaylıca yazın...' : 'Write your full story guess...'}
                className="w-full bg-gray-950 border border-gray-800 focus:border-violet-500 rounded-xl p-3 text-sm text-white placeholder-gray-600 outline-none"
              />

              {guessFeedback && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  guessFeedback.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {guessFeedback.message}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGuessModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl"
                >
                  {isTr ? 'Kapat' : 'Close'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-900/30"
                >
                  {isTr ? 'Tahmini Gönder' : 'Submit Guess'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
