import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, LockOpen, AlertCircle, Download, Key, Settings, Loader2, ChevronDown, Cpu, RefreshCw, FileText, ShieldCheck } from 'lucide-react';
import PdfWorker from './pdfWorker?worker';

// @ts-ignore
import QPDF from 'qpdf-wasm-esm-embedded';

const COMMON_PASSWORDS = ['', '123', '1234', '12345', '123456', '12345678', 'password', 'admin', '0000', '1111', '123123', 'subzero', 'shuang', 'rong', 'rider', 'quest', 'qiang', 'pppp', 'pian', 'petrov', 'otto', 'nuan', 'ning', 'myname', 'matthews', 'martine', 'mandarin', 'magical', 'latinas', 'lalalala', 'kotaku', 'jjjjj', 'jeffery', 'jameson', 'iamgod', 'hellos', 'hassan', 'Harley', 'godfathe', 'geng', 'gabriela', 'foryou', 'ffffffff', 'divorce', 'darius', 'chui', 'breasts', 'bluefish', 'binladen', 'bigtit', 'anne', 'alexia', '2727', '19771977', '19761976', '2061989', '2041984', 'zhui', 'zappa', 'yfnfkmz', 'weng', 'tricia', 'tottenham', 'tiberius', 'teddybear', 'spinner', 'spice', 'spectre', 'solo', 'silverad', 'silly', 'shuo', 'sherri', 'samtron', 'poland', 'poiuy', 'pickup', 'pdtplf', 'paloma', 'ntktajy', 'northern', 'nasty1', 'musashi', 'missy1', 'microphone', 'meat', 'manman', 'lucille', 'lotus', 'letter', 'kendra', 'iomega', 'hootie', 'forward', 'elite', 'electron', 'electra', 'duan', 'DRAGON', 'dotcom', 'dirtbike', 'dianne', 'desiree', 'deadpool', 'darrell', 'cosmic', 'common', 'chrome', 'cathy', 'carpedie', 'bilbo', 'bella1', 'beemer', 'bearcat', 'bank', 'ashley1', 'asdfzxcv', 'amateurs', 'allan', 'absolute', '50spanks', '147963', '120676', '1123', '2021983', 'zang', 'virtual', 'vampires', 'vadim', 'tulips', 'sweet1', 'suan', 'spread', 'spanish', 'some', 'slapper', 'skylar', 'shiner', 'sheng', 'shanghai', 'sanfran', 'ramones', 'property', 'pheonix', 'password2', 'pablo', 'othello', 'orange1', 'nuggets', 'netscape', 'ludmila', 'lost', 'liang', 'kakashka', 'kaitlyn', 'iscool', 'huang', 'hillary', 'high', 'hhhh', 'heater', 'hawaiian', 'guang', 'grease', 'gfhjkmgfhjkm', 'gfhjkm1', 'fyutkbyf', 'finance', 'farley', 'dogshit', 'digital1', 'crack', 'counter', 'corsair', 'company', 'colonel', 'claudi', 'carolin', 'caprice', 'caligula', 'bulls', 'blackout', 'beatle', 'beans', 'banzai', 'banner', 'artem', '9562876', '5656', '1945', '159632', '15151515', '123456qw', '1234567891', '2051983', '2041983', '2031987', '2021989', 'z1x2c3v4', 'xing', 'vSjasnel12', 'twenty', 'toolman', 'thing', 'testpass', 'stretch', 'stonecold', 'soulmate', 'sonny', 'snuffy', 'shutup', 'shuai', 'shao', 'rhino', 'q2w3e4r5', 'polly', 'poipoi', 'pierce', 'piano', 'pavlov', 'pang', 'nicole1', 'millions', 'marsha', 'lineage2', 'liao', 'lemon', 'kuai', 'keller', 'jimmie', 'jiao', 'gregor', 'ggggg', 'game', 'fuckyo', 'fuckoff1', 'friendly', 'fgtkmcby', 'evan', 'edgar', 'dolores', 'doitnow', 'dfcbkbq', 'criminal', 'coldbeer', 'chuckie', 'chimera', 'chan', 'ccccc', 'cccc', 'cards', 'capslock', 'cang', 'bullfrog', 'bonjovi', 'bobdylan', 'beth', 'berger', 'barker', 'balance', 'badman', 'bacchus', 'babylove', 'argentina', 'annabell', 'akira', '646464', '15975', '1223', '11221122', '1022', '2081986', '2041988', '2041987', '2041982', '2011988', 'zong', 'zhang', 'yummy', 'yeahbaby', 'vasilisa', 'temp123', 'tank', 'slim', 'skyler', 'silent', 'sergeant', 'reynolds', 'qazwsx1', 'PUSSY', 'pasword', 'nomore', 'noelle', 'nicol', 'newyork1', 'mullet', 'monarch', 'merlot', 'mantis', 'mancity', 'magazine', 'llllllll', 'kinder', 'kilroy', 'katherine', 'jayhawks', 'jackpot', 'ipswich', 'hack', 'fishing1', 'fight', 'ebony', 'dragon12', 'dog123', 'dipshit', 'crusher', 'chippy', 'canyon', 'bigbig', 'bamboo', 'athlon', 'alisha', 'abnormal', 'a11111', '2469', '12365', '9876543', '2101984', '2081985', '2071984', '2011980', '10180', '1011979', 'zhuo', 'zaraza', 'wg8e3wjf', 'triple', 'tototo', 'theater', 'teddy1', 'syzygy', 'susana', 'sonoma', 'slavik', 'shitface', 'sheba', 'sexyboy', 'screen', 'salasana', 'rufus', 'Richard', 'reds', 'rebecca1', 'pussyman', 'pringles', 'preacher', 'park', 'oceans', 'niang', 'momo', 'misfits', 'mikey1', 'media', 'manowar', 'mack', 'kayla', 'jump', 'jorda', 'hondas', 'hollow', 'here', 'heineken', 'halifax', 'gatorade', 'gabriell', 'ferrari1', 'fergie', 'female', 'eldorado', 'eagles1', 'cygnus', 'coolness', 'colton', 'ciccio', 'cheech', 'card', 'boom', 'blaze', 'bhbirf', 'BASEBALL', 'barton', '655321', '1818', '14141414', '123465', '1224', '1211', '111111a', '2021982', 'zhao', 'wings', 'warner', 'vsegda', 'tripod', 'tiao', 'thunderb', 'telephon', 'tdutybz', 'talon', 'speedo', 'specialk', 'shepherd', 'shadows', 'samsun', 'redbird', 'race', 'promise', 'persik', 'patience', 'paranoid', 'orient', 'monster1', 'missouri', 'mets', 'mazda', 'masamune', 'martin1', 'marker', 'march', 'manning', 'mamamama', 'licking', 'lesley', 'laurence', 'jezebel', 'jetski', 'hopeless', 'hooper', 'homeboy', 'hole', 'heynow', 'forum', 'foot', 'ffff', 'farscape', 'estrella', 'entropy', 'eastwood', 'dwight', 'dragonba', 'door', 'dododo', 'deutsch', 'crystal1', 'corleone', 'cobalt', 'chopin', 'chevrolet', 'cattle', 'carlitos', 'buttercu', 'butcher', 'bushido', 'buddyboy', 'blond', 'bingo1', 'becker', 'baron', 'augusta', 'alex123', '998877', '24242424', '12365478', '2061988', '2031985', '??????', 'zuan', 'yfcntymrf', 'wowwow', 'winston1', 'vfibyf', 'ventura', 'titten', 'tiburon', 'thoma', 'thelma', 'stroker', 'snooker', 'smokie', 'slippery', 'shui', 'shock', 'seadoo', 'sandwich', 'records', 'rang', 'puffy', 'piramida', 'orion1', 'napoli', 'nang', 'mouth', 'monkey12', 'millwall', 'mexican', 'meme', 'maxxxx', 'magician', 'leon', 'lala', 'lakota', 'jenkins', 'jackson5', 'insomnia', 'harvard', 'HARLEY', 'hardware', 'giorgio', 'ginger1', 'george1', 'gator1', 'fountain', 'fastball', 'exotic', 'elizaveta', 'dialog', 'davide', 'channel', 'castro', 'bunnies', 'borussia', 'asddsa', 'andromed', 'alfredo', 'alejandro', '69696', '4417', '3131', '258852', '1952', '147741', '1234asdf', '2081982', '2051982', 'zzzzzzz', 'zeng', 'zalupa', 'yong', 'windsurf', 'wildcard', 'weird', 'violin', 'universal', 'sunflower', 'suicide', 'strawberry', 'stepan', 'sphinx', 'someone', 'sassy1', 'romano', 'reddevil', 'raquel', 'rachel1', 'pornporn', 'polopolo', 'pluto', 'plasma', 'pinkfloyd', 'panther1', 'north', 'milo', 'maxime', 'matteo', 'malone', 'major', 'mail', 'lulu', 'ltybcrf', 'lena', 'lassie', 'july', 'jiggaman', 'jelly', 'islander', 'inspiron', 'hopeful', 'heng', 'hans', 'green123', 'gore', 'gooner', 'goirish', 'gadget', 'freeway', 'fergus', 'eeeee', 'diego', 'dickie', 'deep', 'danny1', 'cuan', 'cristian', 'conover', 'civic', 'Buster', 'bombers', 'bird33', 'bigfish', 'bigblue', 'bian', 'beng', 'beacon', 'barnes', 'astro', 'artemka', 'annika', 'anita', 'Andrew', '747474', '484848', '464646', '369258', '225588', '1z2x3c', '1a2s3d4f', '123456qwe', '2061980', '2031982', '2011984', 'zaqxswcde', 'wrench', 'washington', 'violetta', 'tuning', 'trainer', 'tootie', 'store', 'spurs1', 'sporty', 'sowhat', 'sophi', 'smashing', 'sleeper', 'slave1', 'sexysexy', 'seeking', 'sam123', 'robotics', 'rjhjktdf', 'reckless', 'pulsar', 'project', 'placebo', 'paddle', 'oooo', 'nightmare', 'nanook', 'married', 'linda1', 'lilian', 'lazarus', 'kuang', 'knockers', 'killkill', 'keng', 'katherin', 'Jordan', 'jellybea', 'jayson', 'iloveme', 'hunt', 'hothot', 'homerj', 'hhhhhhhh', 'helene', 'haggis', 'goat', 'ganesh', 'gandalf1', 'fulham', 'force', 'dynasty', 'drakon', 'download', 'doomsday', 'dieter', 'devil666', 'desmond', 'darklord', 'daemon', 'dabears', 'cramps', 'cougars', 'clowns', 'classics', 'citizen', 'cigar', 'chrysler', 'carlito', 'candace', 'bruno1', 'browning', 'brodie', 'bolton', 'biao', 'barbados', 'aubrey', 'arlene', 'arcadia', 'amigo', 'abstr', '9293709b13', '737373', '4444444', '4242', '369852', '20202020', '1qa2ws', '1Pussy', '1947', '1234560', '1112', '1000000', '2091983', '2061987', '1081989', 'zephyr', 'yugioh', 'yjdsqgfhjkm', 'woofer', 'wanted', 'volcom', 'verizon', 'tripper', 'toaster', 'tipper', 'tigger1', 'tartar', 'superb', 'stiffy', 'spock', 'soprano', 'snowboard', 'sexxxy', 'senator', 'scrabble', 'santafe', 'sally1', 'sahara', 'romero', 'rhjrjlbk', 'reload', 'ramsey', 'rainbow6', 'qazwsxedc123', 'poopy', 'pharmacy', 'obelix', 'normal', 'nevermind', 'mordor', 'mclaren', 'mariposa', 'mari', 'manuela', 'mallory', 'magelan', 'lovebug', 'lips', 'kokoko', 'jakejake', 'insanity', 'iceberg', 'hughes', 'hookup', 'hockey1', 'hamish', 'graphics', 'geoffrey', 'firewall', 'fandango', 'ernie', 'dottie', 'doofus', 'donovan', 'domain', 'digimon', 'darryl', 'darlene', 'dancing', 'county', 'chloe1', 'chantal', 'burrito', 'bummer', 'bubba69', 'brett', 'bounty', 'bigcat', 'bessie', 'basset', 'augustus', 'ashleigh', '878787', '3434', '321321321', '12051988', '111qqq', '1023', '1013', '5051987', '2101989', '2101987', '2071987', '2071980', '2041985', 'titan', 'thong', 'sweetnes', 'stanislav', 'sssssss', 'snappy', 'shanti', 'shanna', 'shan', 'script', 'scorpio1', 'RuleZ', 'rochelle', 'rebel1', 'radiohea', 'q1q2q3', 'puss', 'pumpkins', 'puffin', 'onetwo', 'oatmeal', 'nutmeg', 'ninja1', 'nichole', 'mobydick', 'marine1', 'mang', 'lover1', 'longjohn', 'lindros', 'killjoy', 'kfhbcf', 'karen1', 'jingle', 'jacques', 'iverson3', 'istanbul', 'iiiiii', 'howdy', 'hover', 'hjccbz', 'highheel', 'happiness', 'guitar1', 'ghosts', 'georg', 'geneva', 'gamecock', 'fraser', 'faithful', 'dundee', 'dell', 'creature', 'creation', 'corey', 'concorde', 'cleo', 'cdtnbr', 'carmex2', 'budapest', 'bronze', 'brains', 'blue12', 'battery', 'attila', 'arrow', 'anthrax', 'aloha', '383838', '19711971', '1948', '134679852', '123qw', '123000', '2091984', '2091981', '2091980', '2061983', '2041981', '1011900', 'zhjckfd', 'zazaza', 'wingman', 'windmill', 'wifey', 'webhompas', 'watch', 'thisisit', 'tech', 'submit', 'stress', 'spongebo', 'silver1', 'senators', 'scott1', 'sausages', 'radical', 'qwer12', 'ppppp', 'pixies', 'pineapple', 'piazza', 'patrice', 'officer', 'nygiants', 'nikitos', 'nigga', 'nextel', 'moses', 'moonbeam', 'mihail', 'MICHAEL', 'meagan', 'marcello', 'maksimka', 'loveless', 'lottie', 'lollypop', 'laurent', 'latina', 'kris', 'kleopatra', 'kkkk', 'kirsty', 'katarina', 'kamila', 'jets', 'iiii', 'icehouse', 'hooligan', 'gertrude', 'fullmoon', 'fuckinside', 'fishin', 'everett', 'erin', 'dynamite', 'dupont', 'dogcat', 'dogboy', 'diane', 'corolla', 'citadel', 'buttfuck', 'bulldog1', 'broker', 'brittney', 'boozer', 'banger', 'aviation', 'almond', 'aaron1', '78945', '616161', '426hemi', '333777', '22041987', '2008', '20022002', '153624', '1121', '111111q', '5051985', '2081977', '2071988', '2051988', '2051987', '2041979', 'zander', 'wwww', 'webmaste', 'webber', 'taylor1', 'taxman', 'sucking', 'stylus', 'spoon', 'spiker', 'simmons', 'sergi', 'sairam', 'royal', 'ramrod', 'radiohead', 'popper', 'platypus', 'pippo', 'pepito', 'pavel', 'monkeybo', 'Michael1', 'master12', 'marty', 'kjkszpj', 'kidrock', 'judy', 'juanita', 'joshua1', 'jacobs', 'idunno', 'icu812', 'hubert', 'heritage', 'guyver', 'gunther', 'Good123654', 'ghost1', 'getout', 'gameboy', 'format', 'festival', 'evolution', 'epsilon', 'enrico', 'electro', 'dynamo', 'duckie', 'drive', 'dolphin1', 'ctrhtn', 'cthtuf', 'cobain', 'club', 'chilly', 'charter', 'celeb', 'cccccccc', 'caught', 'cascade', 'carnage', 'bunker', 'boxers', 'boxer', 'bombay', 'bigboss', 'bigben', 'beerman', 'baggio', 'asdf12', 'arrows', 'aptiva', 'a1a2a3', 'a12345678', '626262', '26061987', '1616', '15051981', '8031986', '60606', '2061984', '2061982', '2051989', '2051984', '2031981', 'woodland', 'whiteout', 'visa', 'vanguard', 'towers', 'tiny', 'tigger2', 'temppass', 'super12', 'stop', 'stevens', 'softail', 'sheriff', 'robot', 'reddwarf', 'pussy123', 'praise', 'pistons', 'patric', 'partner', 'niceguy', 'morgan1', 'model', 'mars', 'mariana', 'manolo', 'mankind', 'lumber', 'krusty', 'kittens', 'kirby', 'june', 'johann', 'jared', 'imation', 'henry1', 'heat', 'gobears', 'forsaken', 'Football', 'fiction', 'ferguson', 'edison', 'earnhard', 'dwayne', 'dogger', 'diver', 'delight', 'dandan', 'dalshe', 'cross', 'cottage', 'coolcool', 'coach', 'camila', 'callum', 'busty', 'british', 'biology', 'beta', 'beardog', 'baldwin', 'alone', 'albany', 'airwolf', '987123', '7894561230', '786786', '535353', '21031987', '1949', '13041988', '1234qw', '123456l', '1215', '111000', '11051987', '10011986', '6061986', '2091985', '2021981', '2021979', '1031988', 'vjcrdf', 'uranus', 'tiger123', 'summer99', 'state', 'starstar', 'squeeze', 'spikes', 'snowflak', 'slamdunk', 'sinned', 'shocker', 'season', 'santa', 'sanity', 'salome', 'saiyan', 'renata', 'redrose', 'queenie', 'puppet', 'popo', 'playboy1', 'pecker', 'paulie', 'oliver1', 'ohshit', 'norwich', 'news', 'namaste', 'muscles', 'mortal', 'michael2', 'mephisto', 'mandy1', 'magnet', 'longbow', 'llll', 'living', 'lithium', 'komodo', 'kkkkkkkk', 'kjrjvjnbd', 'killer12', 'kellie', 'julie1', 'jarvis', 'iloveyou2', 'holidays', 'highway', 'havana', 'harvest', 'harrypotter', 'gorgeous', 'giraffe', 'garion', 'frost', 'fishman', 'erika', 'earth', 'dusty1', 'dudedude', 'demo', 'deer', 'concord', 'colnago', 'clit', 'choice', 'chillin', 'bumper', 'blam', 'bitter', 'bdsm', 'basebal', 'barron', 'baker', 'arturo', 'annie1', 'andersen', 'amerika', 'aladin', 'abbott', '81fukkc', '5678', '135791', '1002', '2101986', '2081983', '2041989', '2011989', '1011978', 'zzzxxx', 'zxcvbnm123', 'yyyyyy', 'yuan', 'yolanda', 'winners', 'welcom', 'volkswag', 'vera', 'ursula', 'ultra', 'toffee', 'toejam', 'theatre', 'switch', 'superma', 'Stone55', 'solitude', 'sissy', 'sharp', 'scoobydoo', 'romans', 'roadster', 'punk', 'presiden', 'pool6123', 'playstat', 'pipeline', 'pinball', 'peepee', 'paulina', 'ozzy', 'nutter', 'nights', 'niceass', 'mypassword', 'mydick', 'milan', 'medic', 'mazdarx7', 'mason1', 'marlon', 'mama123', 'lemonade', 'krasotka', 'koroleva', 'karin', 'jennife', 'itsme', 'isaac', 'irishman', 'hookem', 'hewlett', 'hawaii50', 'habibi', 'guitars', 'grande', 'glacier', 'gagging', 'gabriel1', 'freefree', 'francesco', 'food', 'flyfish', 'fabric', 'edward1', 'dolly', 'destin', 'delilah', 'defense', 'codered', 'cobras', 'climber', 'cindy1', 'christma', 'chipmunk', 'chef', 'brigitte', 'bowwow', 'bigblock', 'bergkamp', 'bearcats', 'baba', 'altima', '74108520', '45M2DO5BS', '30051985', '258258', '24061986', '22021989', '21011989', '20061988', '1z2x3c4v', '14061991', '13041987', '123456m', '12021988', '11081989', '3041991', '2071981', '2031979', '2021976', '1061990', '1011960', 'yvette', 'yankees2', 'wireless', 'werder', 'wasted', 'visual', 'trust', 'tiffany1', 'stratus', 'steffi', 'stasik', 'starligh', 'sigma', 'rubble', 'ROBERT', 'register', 'reflex', 'redfox', 'record', 'qwerty7', 'premium', 'prayer', 'players', 'pallmall', 'nurses', 'nikki1', 'nascar24', 'mudvayne', 'moritz', 'moreno', 'moondog', 'monsters', 'micro', 'mickey1', 'mckenzie', 'mazda626', 'manila', 'madcat', 'louie', 'loud', 'krypton', 'kitchen', 'kisskiss', 'kate', 'jubilee', 'impact', 'Horny', 'hellboy', 'groups', 'goten', 'gonzalez', 'gilles', 'gidget', 'gene', 'gbhfvblf', 'freebird', 'federal', 'fantasia', 'dogbert', 'deeper', 'dayton', 'comanche', 'cocker', 'choochoo', 'chambers', 'borabora', 'bmw325', 'blast', 'ballin', 'asdfgh01', 'alissa', 'alessandro', 'airport', 'abrakadabra', '7777777777', '635241', '494949', '420000', '23456789', '23041987', '19701970', '1951', '18011987', '172839', '1235', '123456789s', '1125', '1102', '1031', '7071987', '2091989', '2071989', '2071983', '2021973', '2011981', '1121986', '1071986', '101', 'zodiac', 'yogibear', 'word', 'water1', 'wasabi', 'wapbbs', 'wanderer', 'vintage', 'viktoriya', 'varvara', 'upyours', 'undertak', 'underground', 'undead', 'umpire', 'tropical', 'tiger2', 'threesom', 'there', 'sunfire', 'sparky1', 'snoopy1', 'smart', 'slowhand', 'sheridan', 'sensei', 'savanna', 'rudy', 'redsox1', 'ramirez', 'prowler', 'postman', 'porno1', 'pocket', 'pelican', 'nfytxrf', 'nation', 'mykids', 'mygirl', 'moskva', 'mike123', 'Master1', 'marianna', 'maggie1', 'maggi', 'live', 'landon', 'lamer', 'kissmyass', 'keenan', 'just4fun', 'julien', 'juicy', 'JORDAN', 'jimjim', 'hornets', 'hammond', 'hallie', 'glenn', 'ghjcnjgfhjkm', 'gasman', 'FOOTBALL', 'flanker', 'fishhead', 'firefire', 'fidelio', 'fatty', 'excalibur', 'enterme', 'emilia', 'ellie', 'eeee', 'diving', 'dindom', 'descent', 'daniele', 'dallas1', 'customer', 'contest', 'compass', 'comfort', 'comedy', 'cocksuck', 'close', 'clay', 'chriss', 'chiara', 'cameron1', 'calgary', 'cabron', 'bologna', 'berkeley', 'andyod22', 'alexey', 'achtung', '45678', '3636', '28041987', '25081988', '24011985', '20111986', '19651965', '1941', '19101987', '19061987', '1812', '14111986', '13031987', '123ewq', '123456123', '12121990', '112112', '10071987', '10031988', '2101988', '2081980', '2021990', '1091987', '1041985', '1011995', 'zebra', 'zanzibar', 'waffle', 'training', 'teenage', 'sweetness', 'sutton', 'sushi', 'suckers', 'spam', 'south', 'sneaky', 'sisters', 'shinobi', 'shibby', 'sexy1', 'rockies', 'presley', 'president', 'pizza1', 'piggy', 'password12', 'olesya', 'nitro', 'motion', 'milk', 'medion', 'markiz', 'lovelife', 'longdong', 'lenny', 'larry1', 'kirk', 'johndeer', 'jefferso', 'james123', 'jackjack', 'ijrjkfl', 'hotone', 'heroes', 'gypsy', 'foxy', 'fishbone', 'fischer', 'fenway', 'eddie1', 'eastern', 'easter', 'drummer1', 'Dragon1', 'Daniel', 'coventry', 'corndog', 'compton', 'chilli', 'chase1', 'catwoman', 'booster', 'avenue', 'armada', '987321', '818181', '606060', '5454', '28021992', '25800852', '22011988', '19971997', '1776', '17051988', '14021985', '13061986', '12121985', '11061985', '10101986', '10051987', '10011990', '9051945', '8121986', '4041991', '3041986', '2101983', '2101981', '2031989', '2031980', '1121988', 'wwwwwww', 'virgil', 'troy', 'torpedo', 'toilet', 'tatarin', 'survivor', 'sundevil', 'stubby', 'straight', 'spotty', 'slater', 'skip', 'sheba1', 'runaway', 'revolver', 'qwerty11', 'qweasd123', 'parol', 'paradigm', 'older', 'nudes', 'nonenone', 'moore', 'mildred', 'michaels', 'lowell', 'knock', 'klaste', 'junkie', 'jimbo1', 'hotties', 'hollie', 'gryphon', 'gravity', 'grandpa', 'ghjuhfvvf', 'frogman', 'freesex', 'foreve', 'felix1', 'fairlane', 'everlast', 'ethan', 'eggman', 'easton', 'denmark', 'deadly', 'cyborg', 'create', 'corinne', 'cisco', 'chick', 'chestnut', 'bruiser', 'broncos1', 'bobdole', 'azazaz', 'antelope', 'anastasiya', '456456456', '415263', '30041986', '29071983', '29051989', '29011985', '28021990', '28011987', '27061988', '25121987', '25031987', '24680', '22021986', '21031990', '20091991', '20031987', '196969', '19681968', '1946', '17061988', '16051989', '16051987', '1210', '11051990', '100500', '8051990', '5051989', '4041988', '2051980', '2051976', '2041980', '2031977', '2011983', '1061986', '1041988', '1011994', 'zxcasdqwe123', 'washburn', 'vfitymrf', 'troll', 'tranny', 'tonight', 'thecure', 'studman', 'spikey', 'soccer12', 'soccer10', 'smirnoff', 'slick1', 'skyhawk', 'skinner', 'shrimp', 'shakira', 'sekret', 'seagull', 'score', 'sasha_007', 'rrrrrrrr', 'ross', 'rollins', 'reptile', 'razor', 'qwert12345', 'pumpkin1', 'porsche1', 'playa', 'notused', 'noname123', 'newcastle', 'never', 'nana', 'MUSTANG', 'minerva', 'megan1', 'marseille', 'marjorie', 'mamamia', 'malachi', 'lilith', 'letmei', 'lane', 'lambda', 'krissy', 'kojak', 'kimball', 'keepout', 'karachi', 'kalina', 'justus', 'joel', 'joe123', 'jerry1', 'irinka', 'hurricane', 'honolulu', 'holycow', 'hitachi', 'highbury', 'hhhhh', 'hannah1', 'hall', 'guess', 'glass', 'gilligan', 'giggles', 'flores', 'fabie', 'eeeeeeee', 'dungeon', 'drifter', 'dogface', 'dimas', 'dentist', 'death666', 'costello', 'castor', 'bronson', 'brain', 'bolitas', 'boating', 'benben', 'baritone', 'bailey1', 'badgers', 'austin1', 'astra', 'asimov', 'asdqwe', 'armand', 'anthon', 'amorcit', '797979', '4200', '31011987', '3030', '30031988', '3000gt', '224466', '22071986', '21101986', '21051991', '20091988', '2009', '20051988', '19661966', '18091985', '18061990', '15101986', '15051990', '15011987', '13121985', '12qw12qw', '1234123', '1204', '12031987', '12031985', '11121986', '1025', '1003', '8081988', '8031985', '3031986', '2101979', '2071979', '2071978', '2051985', '2051978', '2051973', '2041975', '2041974', '2031988', '2011982', '1031989', '1011974', 'zoloto', 'zippo', 'wwwwwwww', 'w_pass', 'wildwood', 'wildbill', 'transit', 'superior', 'styles', 'stryker', 'string', 'stream', 'stefanie', 'slugger', 'skillet', 'sidekick', 'show', 'shawna', 'sf49ers', 'Salsero', 'rosario', 'remingto', 'redeye', 'redbaron', 'question', 'quasar', 'ppppppp', 'popova', 'physics', 'papers', 'palermo', 'options', 'mothers', 'moonligh', 'mischief', 'ministry', 'minemine', 'messiah', 'mentor', 'megane', 'mazda6', 'marti', 'marble', 'leroy', 'laura1', 'lantern', 'Kordell1', 'koko', 'knuckles', 'khan', 'kerouac', 'kelvin', 'jorge', 'joebob', 'jewel', 'iforget', 'Hunter', 'house1', 'horace', 'hilary', 'grand', 'gordo', 'glock', 'georgie', 'George', 'fuckhead', 'freefall', 'films', 'fantomas', 'extra', 'ellen', 'elcamino', 'doors', 'diaper', 'datsun', 'coldplay', 'clippers', 'chandra', 'carpente', 'carman', 'capricorn', 'calimero', 'boytoy', 'boiler', 'bluesman', 'bluebell', 'bitchy', 'bigpimp', 'bigbang', 'biatch', 'Baseball', 'audi', 'astral', 'armstron', 'angelika', 'angel123', 'abcabc', '999666', '868686', '3x7PxR', '357357', '30041987', '27081990', '26031988', '258369', '25091987', '25041988', '24111989', '23021986', '22041988', '22031984', '21051988', '17011987', '16121987', '15021985', '142857', '14021986', '13021990', '12345qw', '123456ru', '1124', '10101990', '10041986', '7091990', '2051981', '1031985', '1021990', '******', 'zildjian', 'yfnfkb', 'yeah', 'WP2003WP', 'vitamin', 'villa', 'valentine', 'trinitro', 'torino', 'tigge', 'thewho', 'thethe', 'tbone', 'swinging', 'sonia', 'sonata', 'smoke1', 'sluggo', 'sleep', 'simba1', 'shamus', 'sexxy', 'sevens', 'rober', 'rfvfcenhf', 'redhat', 'quentin', 'qazws', 'pufunga7782', 'priest', 'pizdec', 'pigeon', 'pebble', 'palmtree', 'oxygen', 'nostromo', 'nikolai', 'mmmmmmm', 'mahler', 'lorena', 'lopez', 'lineage', 'korova', 'kokomo', 'kinky', 'kimmie', 'kieran', 'jsbach', 'johngalt', 'isabell', 'impreza', 'iloveyou1', 'iiiii', 'huge', 'fuck123', 'franc', 'foxylady', 'fishfish', 'fearless', 'evil', 'entry', 'enforcer', 'emilie', 'duffman', 'ducks', 'dominik', 'david123', 'cutiepie', 'coolcat', 'cookie1', 'conway', 'citroen', 'chinese', 'cheshire', 'cherries', 'chapman', 'changes', 'carver', 'capricor', 'book', 'blueball', 'blowfish', 'benoit', 'Beast1', 'aramis', 'anchor', '741963', '654654', '57chevy', '5252', '357159', '345678', '31031988', '25091990', '25011990', '24111987', '23031990', '22061988', '21011991', '21011988', '1942', '19283746', '19031985', '19011989', '18091986', '17111985', '16051988', '15071987', '145236', '14081985', '132456', '13071984', '1231', '12081985', '1201', '11021985', '10071988', '9021988', '5061990', '2051972', '2041978', '2031983', '1091985', '1031984', '10191', '1012009', 'yamahar1', 'wormix', 'whistler', 'wertyu', 'warez', 'vjqgfhjkm', 'versace', 'universa', 'taco', 'sugar1', 'strawber', 'stacie', 'sprinter', 'spencer1', 'sonyfuck', 'smokey1', 'slimshady', 'skibum', 'series', 'screamer', 'sales', 'roswell', 'roses', 'report', 'rampage', 'qwedsa', 'q11111', 'program', 'Princess', 'petrova', 'patrol', 'papito', 'papillon', 'paco', 'oooooooo', 'mother1', 'mick', 'Maverick', 'marcius2', 'magneto', 'macman', 'luck', 'lalakers', 'lakeside', 'krolik', 'kings', 'kille', 'kernel', 'kent', 'junior1', 'jules', 'jermaine', 'jaguars', 'honeybee', 'hola', 'highlander', 'helper', 'hejsan', 'hate', 'hardone', 'gustavo', 'grinch', 'gratis', 'goth', 'glamour', 'ghbywtccf', 'ghbdtn123', 'elefant', 'earthlink', 'draven', 'dmitriy', 'dkflbr', 'dimples', 'cygnusx1', 'cold', 'cococo', 'clyde', 'cleopatr', 'choke', 'chelse', 'cecile', 'casper1', 'carnival', 'cardiff', 'buddy123', 'bruce1', 'bootys', 'bookie', 'birddog', 'bigbob', 'bestbuy', 'assasin', 'arkansas', 'anastasi', 'alberta', 'addict', 'acmilan', '7896321', '30081984', '258963', '25101988', '23051985', '23041986', '23021989', '22121987', '22091988', '22071987', '22021988', '2006', '20052005', '19051987', '15041988', '15011985', '14021990', '14011986', '13051987', '13011988', '13011987', '12345s', '12061988', '12041988', '12041986', '11111q', '11071988', '11031988', '10081989', '8081986', '7071990', '7071977', '5071984', '4041983', '3021986', '2091988', '2081976', '2051977', '2031978', '1071987', '1041987', '1011976', 'zack', 'zachary1', 'yoyoma', 'wrestler', 'weston', 'wealth', 'wallet', 'vjkjrj', 'vendetta', 'twiggy', 'twelve', 'turnip', 'tribal', 'tommie', 'tkbpfdtnf', 'thecrow', 'test12', 'terminat', 'telephone', 'synergy', 'style', 'spud', 'smackdow', 'slammer', 'sexgod', 'seabee', 'schalke', 'sanford', 'sandrine', 'salope', 'rusty2', 'right', 'repair', 'referee', 'ratman', 'radar', 'qwert40', 'qwe123qwe', 'prozac', 'portal', 'polish', 'Patrick', 'passes', 'otis', 'oreo', 'option', 'opendoor', 'nuclear', 'navy', 'nautilus', 'nancy1', 'mustang6', 'murzik', 'mopar', 'monty1', 'Misfit99', 'mental', 'medved', 'marseill', 'magpies', 'magellan', 'limited', 'Letmein1', 'lemmein', 'leedsutd', 'larissa', 'kikiki', 'jumbo', 'jonny', 'jamess', 'jackass1', 'install', 'hounddog', 'holes', 'hetfield', 'heidi1', 'harlem', 'gymnast', 'gtnhjdbx', 'godlike', 'glow', 'gideon', 'ghhh47hj7649', 'flip', 'flame', 'fkbyjxrf', 'fenris', 'excite', 'espresso', 'ernesto', 'dontknow', 'dogpound', 'dinner', 'diablo2', 'dejavu', 'conan', 'complete', 'cole', 'chocha', 'chips', 'chevys', 'cayman', 'breanna', 'borders', 'blue32', 'blanco', 'bismillah', 'biker', 'bennie', 'benito', 'azazel', 'ashle', 'arianna', 'argentin', 'antonia', 'alanis', 'advent', 'acura', '858585', '4040', '333444', '30041985', '29071985', '29061990', '27071987', '27061985', '27041990', '26031990', '24031988', '23051990', '2211', '22011986', '21061986', '20121989', '20092009', '20091986', '20081991', '20041988', '20041986', '1qwerty', '19671967', '1950', '19121989', '19061990', '18101987', '18051988', '18041986', '18021984', '17101986', '17061989', '17041991', '16021990', '15071988', '15071986', '14101987', '135798642', '13061987', '1234zxcv', '12321', '1214', '12071989', '1129', '11121985', '11061991', '10121987', '101101', '10101985', '10031987', '100200', '9041987', '9031988', '6041988', '5071988', '3081989', '2071985', '2071975', '1051989', '1041992', '1041990', 'zarina', 'woodie', 'whiteboy', 'white1', 'waterboy', 'volkov', 'vlad', 'virus', 'vikings1', 'viewsoni', 'vbkfirf', 'trans', 'terefon', 'swedish', 'squeak', 'spanner', 'spanker', 'sixpack', 'seymour', 'sexxx', 'serpent', 'samira', 'roma', 'rogue', 'robocop', 'robins', 'real', 'Qwerty1', 'qazxcv', 'q2w3e4', 'punch', 'pinky1', 'perry', 'peppe', 'penguin1', 'Password123', 'pain', 'optimist', 'onion', 'noway', 'nomad', 'nine', 'morton', 'moonshin', 'money12', 'modern', 'mcdonald', 'mario1', 'maple', 'loveya', 'love1', 'loretta', 'lookout', 'loki', 'lllll', 'llamas', 'limewire', 'konstantin', 'k.lvbkf', 'keisha', 'jones1', 'jonathon', 'johndoe', 'johncena', 'john123', 'janelle', 'intercourse', 'hugo', 'hopkins', 'harddick', 'glasgow', 'gladiato', 'gambler', 'galant', 'gagged', 'fortress', 'factory', 'expert', 'emperor', 'eight', 'django', 'dinara', 'devo', 'daniels', 'crusty', 'cowgirl', 'clutch', 'clarissa', 'cevthrb', 'ccccccc', 'capetown', 'candy1', 'camero', 'camaross', 'callisto', 'butters', 'bigpoppa', 'bigones', 'bigdawg', 'best', 'beater', 'asgard', 'angelus', 'amigos', 'amand', 'alexandre', '9999999999', '8989', '875421', '30011985', '29051985', '2626', '26061985', '25111987', '25071990', '22081986', '22061989', '21061985', '20082008', '20021988', '1a2s3d', '19981998', '16051985', '15111988', '15051985', '15021990', '147896', '14041988', '123567', '12345qwerty', '12121988', '12051990', '12051986', '12041990', '11091989', '11051986', '11051984', '1008', '10061986', '815', '6081987', '6021987', '4041990', '2081981', '2061977', '2041977', '2031975', '1121987', '1061988', '1031986', '1021989', '1021988', 'wolfpac', 'wert', 'vienna', 'venture', 'vehpbr', 'vampir', 'university', 'tuna', 'trucking', 'trip', 'trees', 'transfer', 'tower', 'tophat', 'tomahawk', 'timosha', 'timeout', 'tenchi', 'tabasco', 'sunny1', 'suckmydick', 'suburban', 'stratfor', 'steaua', 'spiral', 'simsim', 'shadow12', 'screw', 'schmidt', 'rough', 'rockie', 'reilly', 'reggae', 'quebec', 'private1', 'printing', 'pentagon', 'pearson', 'peachy', 'notebook', 'noname', 'nokian73', 'myrtle', 'munch', 'moron', 'matthias', 'mariya', 'marijuan', 'mandrake', 'mamacita', 'malice', 'links', 'lekker', 'lback', 'larkin', 'ksusha', 'kkkkk', 'kestrel', 'kayleigh', 'inter', 'insight', 'hotgirls', 'hoops', 'hellokitty', 'hallo123', 'gotmilk', 'googoo', 'funstuff', 'fredrick', 'firefigh', 'finland', 'fanny', 'eggplant', 'eating', 'dogwood', 'doggies', 'dfktynby', 'derparol', 'data', 'damon', 'cvthnm', 'cuervo', 'coming', 'clock', 'cleopatra', 'clarke', 'cheddar', 'cbr900rr', 'carroll', 'canucks', 'buste', 'bukkake', 'boyboy', 'bowman', 'bimbo', 'bighead', 'bball', 'barselona', 'aspen', 'asdqwe123', 'around', 'aries', 'americ', 'almighty', 'adgjmp', 'addison', 'absolutely', 'aaasss', '4ever', '357951', '29061989', '28051987', '27081986', '25061985', '25011986', '24091986', '24061988', '24031990', '21081987', '21041992', '20031991', '2001112', '19061985', '18111987', '18021988', '17071989', '17031987', '16051990', '15021986', '14031988', '14021987', '14011989', '1220', '1205', '120120', '111999', '111777', '1115', '1114', '11011990', '1027', '10011983', '9021989', '7051990', '6051986', '5091988', '5081988', '4061986', '4041985', '3041980', '2101976', '2071976', '2061976', '2011975', '1031983', 'zasada', 'wyoming', 'wendy1', 'washingt', 'warrior1', 'vickie', 'vader1', 'uuuuuu', 'username', 'tupac', 'Trustno1', 'tinkerbe', 'suckdick', 'streets', 'strap', 'storm1', 'stinker', 'sterva', 'southpaw', 'solaris', 'sloppy', 'sexylady', 'sandie', 'roofer', 'rocknrol', 'rico', 'rfhnjirf', 'QWERTY', 'qqqqq1', 'punker', 'progress', 'platon', 'Phoenix', 'Phoeni', 'peeper', 'pastor', 'paolo', 'page', 'obsidian', 'nirvana1', 'nineinch', 'nbvjatq', 'navigator', 'native', 'money123', 'modelsne', 'minimoni', 'millenium', 'max333', 'maveric', 'matthe', 'marriage', 'marquis', 'markie', 'marines1', 'marijuana', 'margie', 'little1', 'lfybbk', 'klizma', 'kimkim', 'kfgjxrf', 'joshu', 'jktxrf', 'jennaj', 'irishka', 'irene', 'ilove', 'hunte', 'htubcnhfwbz', 'hottest', 'heinrich', 'happy2', 'hanson', 'handball', 'greedy', 'goodie', 'golfer1', 'gocubs', 'gerrard', 'gabber', 'fktyrf', 'facebook', 'eskimo', 'elway7', 'dylan1', 'dominion', 'domingo', 'dogbone', 'default', 'darkangel', 'cumslut', 'cumcum', 'cricket1', 'coral', 'coors', 'chris123', 'charon', 'challeng', 'canuck', 'call', 'calibra', 'buceta', 'bubba123', 'bricks', 'bozo', 'blues1', 'bluejays', 'berry', 'beech', 'awful', 'Apr-01', 'antonina', 'antares', 'another', 'andrea1', 'amore', 'alena', 'aileen', 'a1234', '996633', '556677', '5329', '5201314', '3006', '28051986', '28021985', '27031989', '26021987', '25101989', '25061986', '25041985', '25011985', '24061987', '23021985', '23011985', '223322', '22121986', '22121983', '22081983', '22071989', '22061987', '22061941', '22041986', '22021985', '21021985', '2007', '20031988', '1qaz', '199999', '19101990', '19071988', '19071986', '18061985', '18051990', '17071985', '16111990', '16061986', '16011989', '15081991', '15051987', '14071987', '13031986', '123qwer', '1235789', '123459', '1227', '1226', '12101988', '12081984', '12071987', '1200', '11121987', '11081987', '11071985', '11011991', '1101', '1004', '8071987', '8061987', '5061986', '4061991', '3111987', '3071987', '2091976', '2081979', '2041976', '2031973', '2021991', '2021980', '2021971', 'zouzou', 'yaya', 'wxcvbn', 'wolfen', 'wives', 'wingnut', 'whatwhat', 'Welcome1', 'wanking', 'VQsaBLPzLa', 'truth', 'tracer', 'trace', 'theforce', 'terrell', 'sylveste', 'susanna', 'stephane', 'stephan', 'spoons', 'spence', 'sixty', 'sheepdog', 'services', 'sawyer', 'sandr', 'saigon', 'rudolf', 'rodeo', 'roadrunner', 'rimmer', 'ricard', 'republic', 'redskin', 'Ranger', 'ranch', 'proton', 'post', 'pigpen', 'peggy', 'paris1', 'paramedi', 'ou8123', 'nevets', 'nazgul', 'mizzou', 'midnite', 'metroid', 'Matthew', 'masterbate', 'margarit', 'loser1', 'lolol', 'lloyd'];
const MAX_SMART_ATTEMPTS = 200000;

export default function UnlockTool() {
  const [file, setFile] = useState<File | null>(null);
  
  const [isAes256, setIsAes256] = useState(false);
  const [status, setStatus] = useState<'idle' | 'auto_cracking' | 'needs_password' | 'smart_cracking' | 'processing_wasm' | 'unlocked' | 'error'>('idle');
  
  const [unlockedPdfBytes, setUnlockedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [progress, setProgress] = useState(0);
  const [currentTry, setCurrentTry] = useState(''); 
  
  const [triedPasswords, setTriedPasswords] = useState<Set<string>>(new Set());
  
  const workersRef = useRef<Worker[]>([]);
  const stopBruteForceRef = useRef(false);

  const [manualPassword, setManualPassword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Hints States
  const [lenMin, setLenMin] = useState(4);
  const [lenMax, setLenMax] = useState(6);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasSymbols, setHasSymbols] = useState(false);
  const [firstChar, setFirstChar] = useState('');
  const [lastChar, setLastChar] = useState('');
  const [middleHint, setMiddleHint] = useState('');
  
  const [exactAlphabets, setExactAlphabets] = useState<string>('');
  const [exactNumbers, setExactNumbers] = useState<string>('');
  const [exactSymbols, setExactSymbols] = useState<string>('');

  // SEO: Update Title and Meta Description on load
  useEffect(() => {
    document.title = "Unlock PDF Free | Smart Password Recovery for Students";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Remove PDF passwords for free instantly. Use our smart engine to auto-recover forgotten passwords or bypass secure AES-256 locks securely and fast.');
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', 'Remove PDF passwords for free instantly. Use our smart engine to auto-recover forgotten passwords or bypass secure AES-256 locks securely and fast.');
      document.head.appendChild(metaDescription);
    }
  }, []);

  const terminateAllWorkers = () => {
    workersRef.current.forEach(worker => worker.terminate());
    workersRef.current = [];
  };

  const handleStopSmartCracking = () => {
    stopBruteForceRef.current = true;
    setStatus('needs_password');
    setErrorMessage("Smart Recovery stopped manually.");
  };

  const resetTool = () => {
    setFile(null);
    setUnlockedPdfBytes(null);
    setStatus('idle');
    setErrorMessage('');
    setProgress(0);
    setCurrentTry('');
    setIsAes256(false);
    setManualPassword('');
    setTriedPasswords(new Set());
    stopBruteForceRef.current = false;
  };

  const unlockWithWasm = async (passwordToTry: string, pdfBytes: Uint8Array): Promise<Uint8Array> => {
    const qpdf = await QPDF();
    try {
      qpdf.FS.writeFile('input.pdf', pdfBytes);
      try { qpdf.FS.unlink('output.pdf'); } catch(e){} 
      
      qpdf.callMain(['--password=' + passwordToTry, '--decrypt', 'input.pdf', 'output.pdf']);
      const unlockedBytes = qpdf.FS.readFile('output.pdf');
      
      if (!unlockedBytes || unlockedBytes.length === 0) {
        throw new Error("Wrong password - 0 byte file generated");
      }
      
      try { qpdf.FS.unlink('input.pdf'); qpdf.FS.unlink('output.pdf'); } catch(e){}
      return unlockedBytes;
    } catch (e) {
      try { qpdf.FS.unlink('input.pdf'); qpdf.FS.unlink('output.pdf'); } catch(err){}
      throw new Error("Wrong password");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); 
      };
      reader.onerror = error => reject(error);
    });
  };

  // Worker-based dictionary attack
  const runDictionaryAttack = (passwordsToTry: string[], pdfBytes: Uint8Array): Promise<void> => {
    return new Promise((resolve) => {
      const numCores = navigator.hardwareConcurrency || 4;
      const chunkSize = Math.ceil(passwordsToTry.length / numCores);
      let activeWorkers = 0;

      for (let i = 0; i < numCores; i++) {
        const chunk = passwordsToTry.slice(i * chunkSize, (i + 1) * chunkSize);
        if (chunk.length === 0) continue;

        activeWorkers++;
        const worker = new PdfWorker();
        workersRef.current.push(worker);

        worker.postMessage({ type: 'dictionary_attack', pdfBytes, passwords: chunk, workerId: i });

        worker.onmessage = async (msg) => {
          const { type, password, currentTry: wTry } = msg.data;

          if (type === 'fatal_error') {
            stopBruteForceRef.current = true;
            terminateAllWorkers();
            setIsAes256(true);
            // Immediately try WASM with the password that triggered the error
            try {
              const unlockedBytes = await unlockWithWasm(password, pdfBytes);
              setUnlockedPdfBytes(unlockedBytes);
              setStatus('unlocked');
            } catch(e) {
              setStatus('needs_password');
              setErrorMessage("High-Security AES-256 Lock Detected! Please enter password manually or use Smart Recovery.");
            }
            resolve();
          }
          else if (type === 'success') {
            stopBruteForceRef.current = true;
            terminateAllWorkers();
            // Unlock the PDF and save bytes
            try {
              const pdfDoc = await PDFDocument.load(pdfBytes, { password });
              const savedBytes = await pdfDoc.save();
              setUnlockedPdfBytes(savedBytes);
              setStatus('unlocked');
            } catch(err) {
              // fallback
            }
            resolve();
          }
          else if (type === 'progress') {
            setCurrentTry(wTry);
          }
          else if (type === 'done') {
            activeWorkers--;
            if (activeWorkers <= 0) resolve();
          }
        };
      }
      // Fallback if no chunks were created
      if (activeWorkers === 0) resolve();
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setStatus('auto_cracking');
    setErrorMessage('');
    setProgress(0);
    setIsAes256(false);
    stopBruteForceRef.current = false;

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      const fileNameWithoutExt = uploadedFile.name.replace('.pdf', '');
      
      const autoTryPasswords = [...COMMON_PASSWORDS, fileNameWithoutExt, fileNameWithoutExt.toLowerCase(), fileNameWithoutExt.toUpperCase()];
      
      let currentTriedSet = new Set<string>(autoTryPasswords);
      setTriedPasswords(currentTriedSet);

      // 1. Worker-based dictionary attack on common + filename passwords
      await runDictionaryAttack(autoTryPasswords, pdfBytes);
      
      // If unlocked or AES detected during the attack, stop further processing
      if (status === 'unlocked' || stopBruteForceRef.current) {
        return;
      }

      // 2. Fetch database passwords and attack
      if (!stopBruteForceRef.current) {
        try {
          const response = await fetch('/api/unlock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fetchPasswordsOnly: true })
          });
          
          const data = await response.json();
          
          if (response.ok && data.success && data.passwords) {
            const dbPasswords = data.passwords.filter((p: string) => p && !currentTriedSet.has(p));
            
            dbPasswords.forEach((p: string) => currentTriedSet.add(p));
            setTriedPasswords(currentTriedSet);

            if (dbPasswords.length > 0) {
              await runDictionaryAttack(dbPasswords, pdfBytes);
            }
          }
        } catch (apiError) {
          console.error("DB Passwords fetch error:", apiError);
        }
      }

      if (status === 'unlocked' || stopBruteForceRef.current) {
        return;
      }

      // If still not unlocked, show password request
      if (status !== 'unlocked' && !stopBruteForceRef.current) {
        setStatus('needs_password');
        if (isAes256) {
          setErrorMessage("Strong Titanium Lock (AES-256) detected. Please enter password or use Smart Recovery.");
        }
      }

    } catch (err: any) {
      setStatus('error');
      setErrorMessage("File format error. Please upload a valid PDF.");
    }
  };

  const handleManualUnlock = async () => {
    if (!file || !manualPassword) return;
    setErrorMessage('');
    setStatus('processing_wasm'); 

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);

      if (isAes256) {
        const bytes = await unlockWithWasm(manualPassword, pdfBytes);
        setUnlockedPdfBytes(bytes);
        setStatus('unlocked');
        return;
      }

      const pdfDoc = await PDFDocument.load(pdfBytes, { password: manualPassword });
      const savedBytes = await pdfDoc.save();
      setUnlockedPdfBytes(savedBytes);
      setStatus('unlocked');
    } catch (error: any) {
      const errorMsg = error.message ? error.message.toLowerCase() : "";
      if (errorMsg.includes('not supported') || errorMsg.includes('encrypt') || errorMsg.includes('aes')) {
        setIsAes256(true); 
        try {
           const arrayBuffer = await file.arrayBuffer();
           const pdfBytes = new Uint8Array(arrayBuffer);
           const bytes = await unlockWithWasm(manualPassword, pdfBytes);
           setUnlockedPdfBytes(bytes);
           setStatus('unlocked');
        } catch (wasmError) {
           setStatus('needs_password');
           setErrorMessage('❌ Galat password! Kripya dobara try karein.');
        }
      } else {
        setStatus('needs_password');
        setErrorMessage('❌ Galat password! Kripya dobara try karein.');
      }
    }
  };

  const getCharPool = () => {
    let pool = '';
    if (hasUppercase) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (hasLowercase) pool += 'abcdefghijklmnopqrstuvwxyz';
    if (hasNumbers) pool += '0123456789';
    if (hasSymbols) pool += '@#$%&*!';
    return pool || 'abcdefghijklmnopqrstuvwxyz0123456789';
  };

  const handleSmartUnlock = async () => {
    if (!file) return;
    setStatus('smart_cracking');
    setErrorMessage('');
    setProgress(0);
    setCurrentTry('Starting Engine...'); 
    stopBruteForceRef.current = false;

    const pool = getCharPool();
    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);

    let unlocked = false;
    let attempts = 0;
    let lastYieldTime = Date.now();

    const reqAlpha = exactAlphabets !== '' ? parseInt(exactAlphabets) : -1;
    const reqNum = exactNumbers !== '' ? parseInt(exactNumbers) : -1;
    const reqSym = exactSymbols !== '' ? parseInt(exactSymbols) : -1;

    for (let len = lenMin; len <= lenMax; len++) {
      if (unlocked || stopBruteForceRef.current) break;

      const startIndices = middleHint ? Array.from({length: Math.max(0, len - middleHint.length + 1)}, (_, i) => i) : [null];

      for (const mIdx of startIndices) {
        if (unlocked || stopBruteForceRef.current) break;

        if (middleHint && mIdx !== null) {
            if (firstChar && mIdx === 0 && middleHint[0] !== firstChar) continue;
            if (lastChar && mIdx + middleHint.length === len && middleHint[middleHint.length - 1] !== lastChar) continue;
        }

        const stack = [{ str: '', depth: 0, alpha: 0, num: 0, sym: 0 }];

        while (stack.length > 0) {
          if (stopBruteForceRef.current || unlocked || attempts >= MAX_SMART_ATTEMPTS) break;

          const { str, depth, alpha, num, sym } = stack.pop()!;

          const remaining = len - depth;
          if (reqAlpha !== -1 && (alpha + remaining < reqAlpha || alpha > reqAlpha)) continue;
          if (reqNum !== -1 && (num + remaining < reqNum || num > reqNum)) continue;
          if (reqSym !== -1 && (sym + remaining < reqSym || sym > reqSym)) continue;

          if (middleHint && mIdx !== null && depth === mIdx) {
             let mAlpha=0, mNum=0, mSym=0;
             for(let i=0; i<middleHint.length; i++){
                 const c = middleHint.charCodeAt(i);
                 if ((c>=65 && c<=90)||(c>=97 && c<=122)) mAlpha++;
                 else if(c>=48 && c<=57) mNum++;
                 else mSym++;
             }
             stack.push({
                 str: str + middleHint,
                 depth: depth + middleHint.length,
                 alpha: alpha + mAlpha,
                 num: num + mNum,
                 sym: sym + mSym
             });
             continue;
          }

          if (depth === 0 && firstChar) {
              let isA=0, isN=0, isS=0;
              const c = firstChar.charCodeAt(0);
              if ((c>=65 && c<=90)||(c>=97 && c<=122)) isA=1; else if(c>=48 && c<=57) isN=1; else isS=1;
              stack.push({ str: firstChar, depth: 1, alpha: isA, num: isN, sym: isS });
              continue;
          }

          if (depth === len - 1 && lastChar) {
              let isA=0, isN=0, isS=0;
              const c = lastChar.charCodeAt(0);
              if ((c>=65 && c<=90)||(c>=97 && c<=122)) isA=1; else if(c>=48 && c<=57) isN=1; else isS=1;
              stack.push({ str: str + lastChar, depth: len, alpha: alpha+isA, num: num+isN, sym: sym+isS });
              continue;
          }

          if (depth === len) {
            if (triedPasswords.has(str)) continue;

            if (reqAlpha !== -1 && alpha !== reqAlpha) continue;
            if (reqNum !== -1 && num !== reqNum) continue;
            if (reqSym !== -1 && sym !== reqSym) continue;

            attempts++;

            const timeLimit = isAes256 ? 20 : 50; 
            if (Date.now() - lastYieldTime > timeLimit) {
              setProgress(Math.round((attempts / MAX_SMART_ATTEMPTS) * 100));
              setCurrentTry(str); 
              await new Promise(resolve => setTimeout(resolve, isAes256 ? 5 : 0)); 
              lastYieldTime = Date.now();
            }

            if (isAes256) {
               try {
                 const bytes = await unlockWithWasm(str, pdfBytes);
                 setUnlockedPdfBytes(bytes);
                 setStatus('unlocked');
                 unlocked = true;
                 break;
               } catch(e) {}
            } else {
               try {
                 const pdfDoc = await PDFDocument.load(pdfBytes, { password: str });
                 const savedBytes = await pdfDoc.save();
                 setUnlockedPdfBytes(savedBytes);
                 setStatus('unlocked');
                 unlocked = true;
                 break;
               } catch(e) {}
            }
          } else {
            for (let i = pool.length - 1; i >= 0; i--) {
                let isA=0, isN=0, isS=0;
                const c = pool.charCodeAt(i);
                if ((c>=65 && c<=90)||(c>=97 && c<=122)) isA=1; else if(c>=48 && c<=57) isN=1; else isS=1;
                stack.push({ str: str + pool[i], depth: depth + 1, alpha: alpha+isA, num: num+isN, sym: sym+isS });
            }
          }
        }
      }
    }

    if (!unlocked && !stopBruteForceRef.current) {
      setStatus('needs_password');
      setErrorMessage(`Smart Cracking Failed. Target ke hisaab se ${attempts} combinations check kiye gaye.`);
    }
  };

  const downloadUnlockedPdf = () => {
    if (!unlockedPdfBytes || !file) return;
    const blob = new Blob([unlockedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unlocked_${file.name}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F6] font-sans text-slate-900 selection:bg-rose-100 selection:text-rose-700 pb-10 md:pb-20 relative">
      {/* BACKGROUND EFFECTS - Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-white via-[#FFF0F0] to-transparent opacity-80" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-orange-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 md:py-12">
        {/* Trust Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-rose-100 shadow-sm text-rose-600 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck size={12} /> Local WASM Engine
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-rose-500/10 border border-rose-50 relative overflow-hidden transition-all duration-500">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-40 bg-gradient-to-b from-rose-400/10 to-transparent pointer-events-none rounded-t-3xl"></div>

          <div className="text-center mb-10 relative z-10 mt-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500 mb-4 tracking-tight">
              Free PDF Password Remover
            </h1>
            <p className="text-gray-500 text-sm sm:text-base font-medium max-w-2xl mx-auto">
              Smart constraints aur WASM Engine ka use karke fast & secure unlocking.
            </p>
          </div>

          {/* Selected File Badge */}
          {file && status !== 'unlocked' && (
            <div className="mb-8 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="inline-flex items-center p-3 px-5 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/60 rounded-2xl max-w-full shadow-sm">
                  <FileText className="w-5 h-5 text-rose-500 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                     <p className="text-sm font-semibold text-rose-900 break-words text-center">
                        {file.name}
                     </p>
                  </div>
               </div>
            </div>
          )}

          {/* Upload Zone */}
          {!file && (
            <div className="px-4 py-8 md:px-12 md:py-20 flex flex-col items-center justify-center h-full min-h-[400px] animate-in fade-in zoom-in-95 duration-500">
              <div className="w-full max-w-[280px] md:max-w-[380px] aspect-square relative group mx-auto cursor-pointer">
                {/* Glowing background */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-rose-400 to-pink-400 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-60 animate-pulse transition duration-700"></div>
                
                {/* Actual Upload Box */}
                <div className="relative h-full bg-white rounded-[1.8rem] md:rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50 flex flex-col items-center justify-center hover:bg-rose-50/50 transition-colors">
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-100 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-rose-500 transition-all duration-300 shadow-inner">
                    <Upload className="w-8 h-8 md:w-10 md:h-10 text-rose-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-lg md:text-2xl font-bold text-slate-800 group-hover:text-rose-600 transition-colors text-center px-4">Tap or Drop Locked PDF</span>
                  <span className="text-xs md:text-sm text-slate-400 mt-2">Secure & Fast Engine</span>
                </div>
              </div>
            </div>
          )}

          {status === 'auto_cracking' && (
            <div className="text-center p-8 sm:p-12 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl border border-rose-100 shadow-inner animate-in fade-in zoom-in-95 duration-500">
              <Loader2 className="animate-spin w-16 h-16 text-rose-500 mx-auto mb-6 drop-shadow-md" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Checking Database...</h3>
              <p className="text-gray-500 font-medium">Turbo speed engine is running 🚀</p>
              
              {currentTry && (
                <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.1)] w-full max-w-full overflow-hidden flex flex-col items-center mx-auto">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Trying Password</span>
                  <div className="w-full overflow-hidden text-center px-2">
                    <span className="font-mono text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600 break-all whitespace-normal leading-relaxed block">
                      {currentTry}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Progress bar only shown if progress > 0 */}
              {progress > 0 && (
                <div className="w-full max-w-md mx-auto mt-8">
                  <div className="bg-gray-200/80 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-rose-400 to-pink-500 h-3 rounded-full transition-all duration-300 ease-out relative shadow-[0_0_15px_rgba(244,63,94,0.5)]" 
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-rose-600 mt-3">{progress}% Checked</p>
                </div>
              )}
            </div>
          )}

          {status === 'processing_wasm' && (
            <div className="text-center p-8 sm:p-12 bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl border border-pink-100 shadow-inner animate-in fade-in zoom-in-95 duration-500">
              <div className="relative w-20 h-20 mx-auto mb-6">
                 <div className="absolute inset-0 bg-pink-300 rounded-full animate-ping opacity-20"></div>
                 <Cpu className="relative z-10 animate-pulse w-20 h-20 text-pink-500 drop-shadow-md" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Decrypting with WASM Engine...</h3>
              <p className="text-gray-600 font-medium">Local C++ engine is safely removing the heavy lock.</p>
            </div>
          )}

          {status === 'smart_cracking' && (
            <div className="text-center p-8 sm:p-12 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl border border-rose-100 shadow-inner animate-in fade-in zoom-in-95 duration-500">
              <Settings className="animate-spin w-16 h-16 text-rose-400 mx-auto mb-6 drop-shadow-md" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Smart Recovery in Progress</h3>
              <div className="inline-block bg-white/60 px-4 py-2 rounded-lg border border-rose-200 mb-4">
                <p className="text-gray-700 font-medium text-sm">Engine: <span className="font-bold text-rose-600">{isAes256 ? 'WASM (AES-256)' : 'Standard'}</span></p>
              </div>
              
              {currentTry && (
                <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.1)] w-full max-w-full overflow-hidden flex flex-col items-center mx-auto">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Trying Password</span>
                  <div className="w-full overflow-hidden text-center px-2">
                    <span className="font-mono text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600 break-all whitespace-normal leading-relaxed block">
                      {currentTry}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="w-full max-w-md mx-auto">
                <div className="bg-gray-200/80 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-rose-400 to-pink-500 h-3 rounded-full transition-all duration-100 ease-out relative shadow-[0_0_15px_rgba(244,63,94,0.5)]" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm font-semibold text-rose-500 mt-2 mb-8">{progress}% Completed</p>
              </div>
              
              <button onClick={handleStopSmartCracking} className="px-8 py-3 bg-white border-2 border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 transform hover:-translate-y-1">
                 Stop Recovery
              </button>
            </div>
          )}

          {status === 'needs_password' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Alert Banner */}
              <div className={`flex items-start sm:items-center p-5 rounded-2xl border shadow-sm ${isAes256 ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-800 border-pink-200' : 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border-amber-200'}`}>
                <AlertCircle className={`w-8 h-8 mr-4 flex-shrink-0 mt-1 sm:mt-0 ${isAes256 ? 'text-pink-500' : 'text-amber-500'}`} />
                <div>
                  <span className="font-extrabold text-lg block mb-1">{isAes256 ? "Titanium Lock (AES-256) Detected" : "Password Required"}</span>
                  <span className="text-sm font-medium opacity-90">{isAes256 ? "File is highly secure. Please enter password or use targeted Smart Recovery." : "Auto-check failed. Please enter the password manually."}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border-l-4 border-red-400 text-red-600 shadow-sm animate-bounce">
                  <p className="text-sm font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> {errorMessage}</p>
                </div>
              )}

              {/* Manual Entry Section */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_0_40px_rgba(244,63,94,0.04)] border border-rose-50 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-rose-400 to-pink-500"></div>
                <h3 className="text-xl font-bold text-gray-800 mb-5">Manual Password Entry</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                     <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input 
                       type="password" 
                       value={manualPassword} 
                       onChange={(e) => setManualPassword(e.target.value)} 
                       onKeyDown={(e) => e.key === 'Enter' && handleManualUnlock()} 
                       placeholder="Enter exact password..." 
                       className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-slate-700 transition-all" 
                     />
                  </div>
                  <button 
                    onClick={handleManualUnlock} 
                    className="bg-slate-900 hover:bg-rose-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-rose-200/50 hover:shadow-rose-300 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center whitespace-nowrap"
                  >
                    <LockOpen className="w-5 h-5 mr-2" /> Unlock
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                 <div className="h-px bg-gray-200 flex-1"></div>
                 <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">OR</span>
                 <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {/* Smart Recovery Accordion */}
              <div className="bg-white rounded-3xl shadow-[0_0_40px_rgba(244,63,94,0.04)] border border-rose-50 overflow-hidden">
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full p-6 sm:p-8 flex justify-between items-center bg-gray-50/50 hover:bg-rose-50/50 transition-colors">
                  <div className="flex items-center text-gray-800 font-bold text-lg text-left">
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mr-4">
                       <Cpu className="w-5 h-5 text-rose-500" />
                    </div>
                    Lost Password? (Smart Recovery)
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-100 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-rose-500" />
                  </div>
                </button>

                {showAdvanced && (
                  <div className="p-6 sm:p-8 space-y-8 border-t border-rose-50 bg-white animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
                      <p className="text-sm text-rose-800 font-medium leading-relaxed">
                        Aapki file ke hisaab se engine pehle se set hai <b className="bg-rose-200 px-2 py-0.5 rounded text-rose-900">({isAes256 ? 'WASM Engine' : 'Standard Engine'})</b>. Niche conditions lagayein taaki engine faltu combinations check na kare aur jaldi unlock ho.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      {/* Basic Hints */}
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                          <label className="font-bold text-gray-700 block mb-3">Password Length Range</label>
                          <div className="flex items-center gap-3">
                             <input type="number" value={lenMin} onChange={e => setLenMin(Number(e.target.value))} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white outline-none font-medium transition-all" placeholder="Min" />
                             <span className="text-gray-400 font-bold">TO</span>
                             <input type="number" value={lenMax} onChange={e => setLenMax(Number(e.target.value))} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white outline-none font-medium transition-all" placeholder="Max" />
                          </div>
                        </div>

                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                          <label className="font-bold text-gray-700 block mb-3">Included Characters</label>
                          <div className="flex flex-wrap gap-4">
                            {[{label: 'A-Z', state: hasUppercase, set: setHasUppercase}, {label: 'a-z', state: hasLowercase, set: setHasLowercase}, {label: '0-9', state: hasNumbers, set: setHasNumbers}, {label: '@#$', state: hasSymbols, set: setHasSymbols}].map((item, idx) => (
                              <label key={idx} className={`cursor-pointer flex items-center px-4 py-2 rounded-lg border-2 transition-all font-medium ${item.state ? 'bg-rose-50 border-rose-400 text-rose-600 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-rose-200'}`}>
                                 <input type="checkbox" checked={item.state} onChange={e => item.set(e.target.checked)} className="hidden"/> 
                                 {item.label}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Position & Middle Hints */}
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                          <div>
                             <label className="font-bold text-gray-700 block mb-2 text-sm">Starting Character?</label>
                             <input type="text" maxLength={1} value={firstChar} onChange={e => setFirstChar(e.target.value)} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white outline-none font-medium transition-all" placeholder="e.g. A" />
                          </div>
                          <div>
                             <label className="font-bold text-gray-700 block mb-2 text-sm">Ending Character?</label>
                             <input type="text" maxLength={1} value={lastChar} onChange={e => setLastChar(e.target.value)} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white outline-none font-medium transition-all" placeholder="e.g. 9" />
                          </div>
                          <div>
                             <label className="font-bold text-gray-700 block mb-2 text-sm">Known string inside?</label>
                             <input type="text" value={middleHint} onChange={e => setMiddleHint(e.target.value)} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white outline-none font-medium transition-all" placeholder="e.g. pintu" />
                          </div>
                        </div>
                      </div>

                      {/* Exact Count Hints (Advanced) */}
                      <div className="md:col-span-2 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center mb-4">
                           <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mr-3"><Settings className="w-4 h-4 text-rose-500"/></div>
                           <p className="text-gray-800 font-bold">Advanced Constraints (Optional)</p>
                        </div>
                        <p className="text-sm text-gray-500 mb-5 font-medium">Agar exactly yaad hai ki kitne letters ya numbers hain, toh fill karein:</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          {[{label: 'Kitne Alphabets?', val: exactAlphabets, set: setExactAlphabets, pl: 'e.g. 4'}, {label: 'Kitne Numbers?', val: exactNumbers, set: setExactNumbers, pl: 'e.g. 2'}, {label: 'Kitne Symbols?', val: exactSymbols, set: setExactSymbols, pl: 'e.g. 1'}].map((item, idx) => (
                             <div key={idx}>
                                <label className="font-bold text-gray-700 text-sm block mb-2">{item.label}</label>
                                <input type="number" min="0" value={item.val} onChange={e => item.set(e.target.value)} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white outline-none font-medium transition-all" placeholder={item.pl} />
                             </div>
                          ))}
                        </div>
                      </div>

                    </div>
                    
                    <button onClick={handleSmartUnlock} className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 sm:py-5 rounded-2xl font-extrabold text-lg tracking-wide shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 mt-6 flex items-center justify-center">
                       <Cpu className="w-6 h-6 mr-3 text-rose-300" /> START TARGETED RECOVERY
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {status === 'unlocked' && (
            <div className="text-center p-8 sm:p-14 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200 shadow-[0_0_50px_rgba(16,185,129,0.15)] animate-in zoom-in duration-500 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-400/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20 animate-bounce">
                 <LockOpen className="w-12 h-12 text-emerald-500 drop-shadow-sm" />
              </div>
              
              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Document Unlocked!</h3>
              <p className="text-emerald-700 font-medium mb-8">Your secure PDF is now completely free of restrictions.</p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
                <button onClick={downloadUnlockedPdf} className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-lg rounded-2xl hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300 transform hover:-translate-y-1">
                  <Download className="w-6 h-6 mr-3" /> Download PDF
                </button>
                <button onClick={resetTool} className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 bg-white border-2 border-emerald-200 text-emerald-700 font-extrabold text-lg rounded-2xl hover:bg-emerald-50 hover:border-emerald-300 shadow-sm transition-all duration-300 transform hover:-translate-y-1">
                  <RefreshCw className="w-6 h-6 mr-3" /> Unlock Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Premium SEO Section below the Application UI */}
        <div className="max-w-4xl mx-auto mt-16 p-6 sm:p-10 bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100 text-left">
          
          {/* Step-by-Step Guide */}
          <div className="mb-14">
             <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-rose-400 to-pink-500 rounded-full mr-4 block"></span>
                How to Unlock a PDF File in 3 Steps
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {[
                  {step: 1, title: 'Upload File', desc: 'Click the upload button to select your secure document.'},
                  {step: 2, title: 'Auto-Engine Runs', desc: 'Our system will instantly test common passwords and database keys.'},
                  {step: 3, title: 'Smart Recovery', desc: 'If AES-256 locked, provide hints to crack it efficiently.'},
                  {step: 4, title: 'Download', desc: 'Click save to get your completely unlocked PDF for free.'}
                ].map(item => (
                   <div key={item.step} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-rose-100 text-rose-600 font-extrabold rounded-full flex items-center justify-center mb-4 text-lg">{item.step}</div>
                      <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                   </div>
                ))}
             </div>
          </div>

          {/* Advanced Features Description */}
          <div className="mb-14">
             <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-pink-400 to-rose-500 rounded-full mr-4 block"></span>
                Advanced Features: AES-256
             </h2>
             <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 sm:p-8 rounded-2xl border border-rose-100">
               <p className="text-gray-700 text-base sm:text-lg leading-relaxed font-medium">
                 Most free online tools fail immediately when they encounter high-security "Titanium Locks" like AES-256 encryption. Our platform runs a specialized <b className="text-rose-600">C++ engine (WASM)</b> directly in your browser. This advanced technology safely and quickly bypasses even the toughest modern security levels.
               </p>
             </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-10">
             <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full mr-4 block"></span>
                Frequently Asked Questions
             </h2>
             <div className="space-y-6">
               {[
                 {q: "Is this PDF unlock tool completely free for students?", a: "Yes, it is 100% free. We built this specifically for students who need to unlock study materials without paying expensive software fees."},
                 {q: "What happens if I completely forgot my PDF password?", a: "Our tool features an automated recovery engine. When you upload your file, it instantly tests thousands of common passwords and runs a turbo number check."},
                 {q: "How does the Targeted Smart Recovery work?", a: "Think of it like giving a detective a few clues. You just tell the tool what you vaguely remember (length, numbers). The system uses these exact hints to test only relevant combinations."},
                 {q: "Are my private documents safe?", a: "Absolutely. The heavy lifting for password recovery and WASM decryption happens locally on your own device. We do not save your files on our servers."}
               ].map((faq, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                     <h3 className="font-bold text-lg text-gray-900 mb-3">{faq.q}</h3>
                     <p className="text-gray-600 font-medium leading-relaxed text-sm sm:text-base">{faq.a}</p>
                  </div>
               ))}
             </div>
          </div>

          {/* Internal Linking for Better SEO Navigation */}
          <div className="mt-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <h3 className="font-extrabold text-2xl sm:text-3xl text-white mb-4 relative z-10">Explore More Free Tools</h3>
            <p className="text-rose-100 text-lg mb-8 relative z-10 font-medium max-w-xl mx-auto">
              Done unlocking? Enhance your documents further with our blazing fast toolkit.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
               <a href="/compress" className="bg-white text-rose-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-rose-50 hover:scale-105 transition-all">Compress PDF</a>
               <a href="/split" className="bg-rose-700 text-white border border-rose-400 px-8 py-4 rounded-xl font-bold hover:bg-rose-800 hover:scale-105 transition-all shadow-lg">Split PDF</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
