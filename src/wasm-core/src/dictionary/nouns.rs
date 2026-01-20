pub fn e2i(word: &str) -> Option<&str> {
    match word {
        // A
        "angina" => None, "apoteka" => Some("apoteka"), // Nema promene

        // B
        "beda" => Some("bijeda"), "bednik" => Some("bijednik"), "bedan" => Some("bijedan"),
        "belance" => Some("bjelance"), "beleg" => Some("biljeg"), "beleška" => Some("bilješka"),
        "beležnica" => Some("bilježnica"), "belina" => Some("bjelina"), "beliti" => Some("bjeliti"),
        "besnilo" => Some("bjesnilo"), "bezbednost" => Some("bezbjednost"),
        "breg" => Some("brijeg"), "bregovi" => Some("bregovi"), "brest" => Some("brijest"),

        // C
        "celina" => Some("cjelina"), "celivanje" => Some("cjelivanje"), "cena" => Some("cijena"),
        "cene" => Some("cijene"), "ceni" => Some("cijeni"), "cenkanje" => Some("cjenkanje"),
        "cenovnik" => Some("cjenovnik"), "cenu" => Some("cijenu"), "cepka" => Some("cjepka"),
        "cev" => Some("cijev"), "cevi" => Some("cijevi"), "cevodod" => Some("cjevovod"),
        "crevo" => Some("crijevo"), "cveće" => Some("cvijeće"), "cvecara" => Some("cvjećara"),
        "cvet" => Some("cvijet"), "cveta" => Some("cvijeta"), "cvetanje" => Some("cvjetanje"),
        "cvetovi" => Some("cvjetovi"), "cvetu" => Some("cvijetu"),

        // Č
        "čovečanstvo" => Some("čovječanstvo"), "čovek" => Some("čovjek"), "čoveka" => Some("čovjeka"),

        // D
        "deca" => Some("djeca"), "dece" => Some("djece"), "deci" => Some("djeci"),
        "decom" => Some("djecom"), "decu" => Some("djecu"), "deda" => Some("djed"),
        "dede" => Some("djeda"), "dedi" => Some("djedu"), "dedovina" => Some("djedovina"),
        "dedu" => Some("djeda"), "dela" => Some("djela"), "delatnost" => Some("djelatnost"),
        "delo" => Some("djelo"), "delom" => Some("djelom"), "delovanje" => Some("djelovanje"),
        "delu" => Some("djelu"), "deo" => Some("dio"), "dete" => Some("dijete"),
        "deteta" => Some("djeteta"), "detetom" => Some("djetetom"), "detetu" => Some("djetetu"),
        "detinjstvo" => Some("djetinjstvo"), "dnevnica" => Some("dnevnica"), "dodela" => Some("dodjela"),
        "dogorevanje" => Some("dogorijevanje"), "doživljaj" => Some("doživljaj"),
        "dremanje" => Some("drijemanje"),

        // G
        "gnezdo" => Some("gnijezdo"), "greh" => Some("grijeh"), "greha" => Some("grijeha"),
        "grejalica" => Some("grijalica"), "grejanje" => Some("grijanje"), "greška" => Some("grješka"),
        "grešnik" => Some("grješnik"),

        // I
        "isceljenje" => Some("iscjeljenje"), "ispovest" => Some("ispovijest"), "izmena" => Some("izmjena"),
        "izum" => Some("izum"), "izveštaj" => Some("izvještaj"),

        // K
        "kolenica" => Some("koljenica"), "koleno" => Some("koljeno"), "koren" => Some("korijen"),
        "krepost" => Some("krjepost"),

        // L
        "lečenje" => Some("liječenje"), "leđa" => Some("leđa"), "lek" => Some("lijek"),
        "lekar" => Some("ljekar"), "lekovi" => Some("lijekovi"), "lenjost" => Some("lijenost"),
        "lepota" => Some("ljepota"), "lepotica" => Some("ljepotica"), "leto" => Some("ljeto"),
        "levica" => Some("ljevica"), "lice" => Some("lice"), "livnica" => Some("livnica"),

        // M
        "medved" => Some("medvjed"), "međa" => Some("međa"), "menjač" => Some("mjenjač"),
        "mera" => Some("mjera"), "merenje" => Some("mjerenje"), "merilo" => Some("mjerilo"),
        "mesec" => Some("mjesec"), "meseca" => Some("mjeseca"), "meseci" => Some("mjeseci"),
        "mesečina" => Some("mjesečina"), "mesta" => Some("mjesta"), "mesto" => Some("mjesto"),
        "mestu" => Some("mjestu"), "mešavina" => Some("mješavina"), "meštanin" => Some("mještanin"),
        "mlekar" => Some("mljekar"), "mleko" => Some("mlijeko"), "mreža" => Some("mreža"),
        "mržnja" => Some("mržnja"),

        // N
        "nada" => Some("nada"), "nagoveštaj" => Some("nagovještaj"), "namena" => Some("namjena"),
        "namera" => Some("namjera"), "nameštaj" => Some("namještaj"), "napredak" => Some("napredak"),
        "naslednik" => Some("nasljednik"), "nasleđe" => Some("nasljeđe"), "navek" => Some("navijek"),
        "nedelja" => Some("nedjelja"), "nemac" => Some("nijemac"), "nemačka" => Some("njemačka"),
        "nemoć" => Some("nemoć"), "nestašica" => Some("nestašica"), "nevera" => Some("nevjera"),
        "neverica" => Some("nevjerica"), "nevesta" => Some("nevjesta"), "nežnost" => Some("nježnost"),

        // O
        "obaveštenje" => Some("obavještenje"), "obećanje" => Some("obećanje"), "odeća" => Some("odjeća"),
        "odeljenje" => Some("odjeljenje"), "odelo" => Some("odijelo"), "odjek" => Some("odjek"),
        "odsek" => Some("odsjek"), "ogrev" => Some("ogrjev"), "opredeljenje" => Some("opredjeljenje"),
        "osećaj" => Some("osjećaj"), "osmeh" => Some("osmijeh"), "osveženje" => Some("osvježenje"),
        "otmica" => Some("otmica"), "ozleda" => Some("ozljeda"),

        // P
        "pena" => Some("pjena"), "pesma" => Some("pjesma"), "pesmama" => Some("pjesmama"),
        "pesme" => Some("pjesme"), "pesmi" => Some("pjesmi"), "pesmom" => Some("pjesmom"),
        "pesmu" => Some("pjesmu"), "pesnik" => Some("pjesnik"), "pešak" => Some("pješak"),
        "petao" => Some("pijetao"), "plen" => Some("plijen"), "pobeda" => Some("pobjeda"),
        "pobednik" => Some("pobjednik"), "podela" => Some("podjela"), "pogled" => Some("pogled"),
        "pogreška" => Some("pogrješka"), "poluvreme" => Some("poluvrijeme"), "ponedeljak" => Some("ponedjeljak"),
        "poreklo" => Some("porijeklo"), "poseta" => Some("posjeta"), "posledica" => Some("posljedica"),
        "potera" => Some("potjera"), "potreba" => Some("potreba"), "poverenje" => Some("povjerenje"),
        "povest" => Some("povijest"), "povreda" => Some("povreda"), "predlog" => Some("prijedlog"),
        "predsednik" => Some("predsjednik"), "predsedništvo" => Some("predsjedništvo"),
        "preduzeće" => Some("preduzeće"), "pregled" => Some("pregled"), "prekretnica" => Some("prekretnica"),
        "prelaz" => Some("prijelaz"), "prelom" => Some("prijelom"), "premeštaj" => Some("premještaj"),
        "prenos" => Some("prijenos"), "preporod" => Some("preporod"), "prepreka" => Some("prepreka"),
        "presek" => Some("presjek"), "prestup" => Some("prijestup"), "preteča" => Some("preteča"),
        "pretnja" => Some("prijetnja"), "prevoz" => Some("prijevoz"), "prevod" => Some("prijevod"),
        "prevodilac" => Some("prevodilac"), "prezir" => Some("prezir"), "pripovetka" => Some("pripovijetka"),
        "primena" => Some("primjena"), "primer" => Some("primjer"), "primerak" => Some("primjerak"),
        "pripad" => Some("pripad"), "prisebnost" => Some("prisabranost"), "privreda" => Some("privreda"),
        "procena" => Some("procjena"), "procenat" => Some("procenat"), "proleće" => Some("proljeće"),
        "promena" => Some("promjena"), "prosveta" => Some("prosvjeta"),

        // R
        "raspodela" => Some("raspodjela"), "raspored" => Some("raspored"), "rasveta" => Some("rasvjeta"),
        "razmeštaj" => Some("razmještaj"), "razumevanje" => Some("razumijevanje"), "reč" => Some("riječ"),
        "rečenica" => Some("rečenica"), "reči" => Some("riječi"), "rečnik" => Some("rječnik"),
        "red" => Some("red"), "redosled" => Some("redoslijed"), "reka" => Some("rijeka"),
        "rekama" => Some("rijekama"), "reke" => Some("rijeke"), "rekom" => Some("rijekom"),
        "reku" => Some("rijeku"), "rešenje" => Some("rješenje"), "rešetka" => Some("rešetka"),
        "rez" => Some("rez"), "rođak" => Some("rođak"),

        // S
        "sastanak" => Some("sastanak"), "savest" => Some("savjest"), "savet" => Some("savjet"),
        "savetnik" => Some("savjetnik"), "sazvežđe" => Some("sazviježđe"), "sećanje" => Some("sjećanje"),
        "sedište" => Some("sjedište"), "sednica" => Some("sjednica"), "sekira" => Some("sjekira"),
        "seme" => Some("sjeme"), "semenka" => Some("sjemenka"), "sena" => Some("sjena"),
        "senka" => Some("sjenka"), "seno" => Some("sijeno"), "seoba" => Some("seoba"),
        "sever" => Some("sjever"), "siv" => Some("siv"), "sledbenik" => Some("sljedbenik"),
        "slepac" => Some("slijepac"), "slepilo" => Some("sljepilo"), "slezina" => Some("slezena"),
        "smeh" => Some("smijeh"), "smer" => Some("smjer"), "smesa" => Some("smjesa"),
        "smeštaj" => Some("smještaj"), "smetlište" => Some("smetlište"), "smetnja" => Some("smetnja"),
        "sneg" => Some("snijeg"), "sneško" => Some("snješko"), "sreća" => Some("sreća"),
        "sreda" => Some("srijeda"), "sredina" => Some("sredina"), "srem" => Some("srijem"),
        "stena" => Some("stijena"), "stene" => Some("stijene"), "strela" => Some("strijela"),
        "strelac" => Some("strijelac"), "streljaštvo" => Some("streljaštvo"), "sused" => Some("susjed"),
        "susedstvo" => Some("susjedstvo"), "sveća" => Some("svijeća"), "svećnjak" => Some("svijećnjak"),
        "svedok" => Some("svjedok"), "svest" => Some("svijest"), "svet" => Some("svijet"),
        "sveta" => Some("svijeta"), "svetlost" => Some("svjetlost"), "svetost" => Some("svetost"),
        "svetovi" => Some("svjetovi"), "svetu" => Some("svijetu"), "svežina" => Some("svježina"),

        // T
        "telo" => Some("tijelo"), "teme" => Some("tjeme"), "tepih" => Some("tepih"),
        "tesnac" => Some("tjesnac"), "testo" => Some("tijesto"), "težina" => Some("težina"),
        "tok" => Some("tok"), "treperenje" => Some("treperenje"), "trezan" => Some("trijezan"),

        // U
        "ubeđenje" => Some("ubjeđenje"), "ucena" => Some("ucjena"), "ugled" => Some("ugled"),
        "ugljen" => Some("ugljen"), "umesto" => Some("umjesto"), "umetnost" => Some("umjetnost"),
        "upotreba" => Some("upotreba"), "uspeh" => Some("uspjeh"), "uteha" => Some("utjeha"),
        "uvreda" => Some("uvreda"),

        // V
        "veče" => Some("veče"), "većina" => Some("većina"), "većnik" => Some("vijećnik"),
        "veće" => Some("vijeće"), "vek" => Some("vijek"), "vekovi" => Some("vjekovi"),
        "venac" => Some("vijenac"), "vera" => Some("vjera"), "vernost" => Some("vjernost"),
        "vesnik" => Some("vjesnik"), "vest" => Some("vijest"), "vesti" => Some("vijesti"),
        "veštica" => Some("vještica"), "veština" => Some("vještina"), "vetar" => Some("vjetar"),
        "veverica" => Some("vjeverica"), "viđenje" => Some("viđenje"), "vreme" => Some("vrijeme"),
        "vremena" => Some("vremena"), "vremenu" => Some("vremenu"), "vreća" => Some("vreća"),

        // Z
        "zagonetka" => Some("zagonetka"), "zahtev" => Some("zahtjev"), "zakletva" => Some("zakletva"),
        "zamerka" => Some("zamjerka"), "zanovetanje" => Some("zanovijetanje"), "zapovest" => Some("zapovijest"),
        "zastava" => Some("zastava"), "zavesa" => Some("zavjesa"), "zavet" => Some("zavjet"),
        "zavist" => Some("zavist"), "zenica" => Some("zjenica"), "zet" => Some("zet"),
        "zrenje" => Some("zrenje"), "zver" => Some("zvijer"), "zvezda" => Some("zvijezda"),
        "zvezde" => Some("zvijezde"),

        // Ž
        "ždrebe" => Some("ždrijebe"), "želja" => Some("želja"), "žena" => Some("žena"),
        "život" => Some("život"),

        _ => None,
    }
}

pub fn i2e(word: &str) -> Option<&str> {
    match word {
        // A
        "angina" => None, "apoteka" => Some("apoteka"),

        // B
        "bednik" => Some("bednik"), "besnilo" => Some("besnilo"), "bezbjednost" => Some("bezbednost"),
        "bijeda" => Some("beda"), "bijednik" => Some("bednik"), "biljeg" => Some("beleg"),
        "bilješka" => Some("beleška"), "bilježnica" => Some("beležnica"), "bjelance" => Some("belance"),
        "bjelina" => Some("belina"), "bjeliti" => Some("beliti"), "bjesnilo" => Some("besnilo"),
        "bregovi" => Some("bregovi"), "brijeg" => Some("breg"), "brijest" => Some("brest"),

        // C
        "cenkanje" => Some("cenkanje"), "cenovnik" => Some("cenovnik"), "cijena" => Some("cena"),
        "cijene" => Some("cene"), "cijeni" => Some("ceni"), "cijenu" => Some("cenu"),
        "cijev" => Some("cev"), "cijevi" => Some("cevi"), "cjelina" => Some("celina"),
        "cjelivanje" => Some("celivanje"), "cjelodnevan" => Some("celodnevan"), "cjelokupan" => Some("celokupan"),
        "cjelovit" => Some("celovit"), "cjenkanje" => Some("cenkanje"), "cjenovnik" => Some("cenovnik"),
        "cjepka" => Some("cepka"), "cjevovod" => Some("cevodod"), "crijevo" => Some("crevo"),
        "cvecara" => Some("cvjećara"), "cveće" => Some("cveće"), "cvijeće" => Some("cveće"),
        "cvijet" => Some("cvet"), "cvijeta" => Some("cveta"), "cvijetu" => Some("cvetu"),
        "cvjećara" => Some("cvecara"), "cvjetanje" => Some("cvetanje"), "cvjetovi" => Some("cvetovi"),

        // Č
        "čovječanstvo" => Some("čovečanstvo"), "čovjek" => Some("čovek"), "čovjeka" => Some("čoveka"),

        // D
        "deca" => Some("deca"), "dece" => Some("dece"), "deci" => Some("deci"), "decom" => Some("decom"),
        "decu" => Some("decu"), "deda" => Some("deda"), "dede" => Some("dede"), "dedi" => Some("dedi"),
        "dedovina" => Some("dedovina"), "dedu" => Some("dedu"), "dela" => Some("dela"),
        "delatnost" => Some("delatnost"), "delo" => Some("delo"), "delom" => Some("delom"),
        "delovanje" => Some("delovanje"), "delu" => Some("delu"), "deo" => Some("deo"),
        "dete" => Some("dete"), "deteta" => Some("deteta"), "detetom" => Some("detetom"),
        "detetu" => Some("detetu"), "detinjstvo" => Some("detinjstvo"), "dijela" => Some("dela"),
        "dijelovi" => Some("delovi"), "dijete" => Some("dete"), "dio" => Some("deo"),
        "djeca" => Some("deca"), "djece" => Some("dece"), "djeci" => Some("deci"), "djecom" => Some("decom"),
        "djecu" => Some("decu"), "djed" => Some("deda"), "djeda" => Some("dede"), "djedu" => Some("dedi"),
        "djela" => Some("dela"), "djelo" => Some("delo"), "djelom" => Some("delom"),
        "djelovanje" => Some("delovanje"), "djelu" => Some("delu"), "djeteta" => Some("deteta"),
        "djetetom" => Some("detetom"), "djetetu" => Some("detetu"), "djetinjast" => Some("detinjast"),
        "djetinjstvo" => Some("detinjstvo"), "dnevnica" => Some("dnevnica"), "dodela" => Some("dodela"),
        "dodjela" => Some("dodela"), "dogorevanje" => Some("dogorevanje"), "dogorijevanje" => Some("dogorevanje"),
        "doživljaj" => Some("doživljaj"), "dremanje" => Some("dremanje"), "drijemanje" => Some("dremanje"),

        // G
        "gnezdo" => Some("gnezdo"), "gnijezdo" => Some("gnezdo"), "greh" => Some("greh"),
        "greha" => Some("greha"), "grejalica" => Some("grejalica"), "grejanje" => Some("grejanje"),
        "greška" => Some("greška"), "grešnik" => Some("grešnik"), "grijalica" => Some("grejalica"),
        "grijanje" => Some("grejanje"), "grijeh" => Some("greh"), "grijeha" => Some("greha"),
        "grješka" => Some("greška"), "grješnik" => Some("grešnik"),

        // I
        "isceljenje" => Some("isceljenje"), "iscjeljenje" => Some("isceljenje"), "ispovest" => Some("ispovest"),
        "ispovijest" => Some("ispovest"), "izmena" => Some("izmena"), "izmjena" => Some("izmena"),
        "izum" => Some("izum"), "izveštaj" => Some("izveštaj"), "izvještaj" => Some("izveštaj"),

        // K
        "kolenica" => Some("kolenica"), "koleno" => Some("koleno"), "koljenica" => Some("kolenica"),
        "koljeno" => Some("koleno"), "koren" => Some("koren"), "korijen" => Some("koren"),
        "krepost" => Some("krepost"), "krjepost" => Some("krepost"),

        // L
        "lečenje" => Some("lečenje"), "leđa" => Some("leđa"), "lek" => Some("lek"), "lekar" => Some("lekar"),
        "lekovi" => Some("lekovi"), "lenjost" => Some("lenjost"), "lepota" => Some("lepota"),
        "lepotica" => Some("lepotica"), "leto" => Some("leto"), "levica" => Some("levica"),
        "lice" => Some("lice"), "liječiti" => Some("lečiti"), "liječenje" => Some("lečenje"),
        "lijek" => Some("lek"), "lijekovi" => Some("lekovi"), "lijenost" => Some("lenjost"),
        "livnica" => Some("livnica"), "ljekar" => Some("lekar"), "ljepota" => Some("lepota"),
        "ljepotica" => Some("lepotica"), "ljeto" => Some("leto"), "ljevica" => Some("levica"),

        // M
        "medved" => Some("medved"), "medvjed" => Some("medved"), "međa" => Some("međa"),
        "menjač" => Some("menjač"), "mera" => Some("mera"), "merenje" => Some("merenje"),
        "merilo" => Some("merilo"), "mesec" => Some("mesec"), "meseca" => Some("meseca"),
        "meseci" => Some("meseci"), "mesečina" => Some("mesečina"), "mesta" => Some("mesta"),
        "mesto" => Some("mesto"), "mestu" => Some("mestu"), "mešanje" => Some("mešanje"),
        "mešavina" => Some("mešavina"), "meštanin" => Some("meštanin"), "miješanje" => Some("mešanje"),
        "mjera" => Some("mera"), "mjerenje" => Some("merenje"), "mjerilo" => Some("merilo"),
        "mjesec" => Some("mesec"), "mjeseca" => Some("meseca"), "mjeseci" => Some("meseci"),
        "mjesečina" => Some("mesečina"), "mjesta" => Some("mesta"), "mjesto" => Some("mesto"),
        "mjestu" => Some("mestu"), "mjenjač" => Some("menjač"), "mješavina" => Some("mešavina"),
        "mještanin" => Some("meštanin"), "mlekar" => Some("mlekar"), "mleko" => Some("mleko"),
        "mlijeko" => Some("mleko"), "mljekar" => Some("mlekar"), "mreža" => Some("mreža"),
        "mržnja" => Some("mržnja"),

        // N
        "nada" => Some("nada"), "nagoveštaj" => Some("nagoveštaj"), "nagovještaj" => Some("nagoveštaj"),
        "namena" => Some("namena"), "namera" => Some("namera"), "namjena" => Some("namena"),
        "namjera" => Some("namera"), "namještaj" => Some("nameštaj"), "nameštaj" => Some("nameštaj"),
        "napredak" => Some("napredak"), "naslednik" => Some("naslednik"), "nasleđe" => Some("nasleđe"),
        "nasljednik" => Some("naslednik"), "nasljeđe" => Some("nasleđe"), "navek" => Some("navek"),
        "navijek" => Some("navek"), "nedelja" => Some("nedelja"), "nedjelja" => Some("nedelja"),
        "nemac" => Some("nemac"), "nemačka" => Some("nemačka"), "nemoć" => Some("nemoć"),
        "nestašica" => Some("nestašica"), "nevera" => Some("nevera"), "neverica" => Some("neverica"),
        "nevesta" => Some("nevesta"), "nevjera" => Some("nevera"), "nevjerica" => Some("neverica"),
        "nevjesta" => Some("nevesta"), "nežnost" => Some("nežnost"), "nijemac" => Some("nemac"),
        "nježnost" => Some("nežnost"), "njemačka" => Some("nemačka"),

        // O
        "obaveštenje" => Some("obaveštenje"), "obavještenje" => Some("obaveštenje"),
        "obećanje" => Some("obećanje"), "odeća" => Some("odeća"), "odeljenje" => Some("odeljenje"),
        "odelo" => Some("odelo"), "odijelo" => Some("odelo"), "odjek" => Some("odjek"),
        "odjeljenje" => Some("odeljenje"), "odjeća" => Some("odeća"), "odsek" => Some("odsek"),
        "odsjek" => Some("odsek"), "ogrev" => Some("ogrev"), "ogrjev" => Some("ogrev"),
        "opredeljenje" => Some("opredeljenje"), "opredjeljenje" => Some("opredeljenje"),
        "osećaj" => Some("osećaj"), "osjećaj" => Some("osećaj"), "osmeh" => Some("osmeh"),
        "osmijeh" => Some("osmeh"), "osveženje" => Some("osveženje"), "osvježenje" => Some("osveženje"),
        "otmica" => Some("otmica"), "ozleda" => Some("ozleda"), "ozljeda" => Some("ozleda"),

        // P
        "pena" => Some("pena"), "pesma" => Some("pesma"), "pesmama" => Some("pesmama"),
        "pesme" => Some("pesme"), "pesmi" => Some("pesmi"), "pesmom" => Some("pesmom"),
        "pesmu" => Some("pesmu"), "pesnik" => Some("pesnik"), "pešak" => Some("pešak"),
        "petao" => Some("petao"), "pijetao" => Some("petao"), "pjena" => Some("pena"),
        "pjesma" => Some("pesma"), "pjesmama" => Some("pesmama"), "pjesme" => Some("pesme"),
        "pjesmi" => Some("pesmi"), "pjesmom" => Some("pesmom"), "pjesmu" => Some("pesmu"),
        "pjesnik" => Some("pesnik"), "pješak" => Some("pešak"), "plen" => Some("plen"),
        "plijen" => Some("plen"), "pobeda" => Some("pobeda"), "pobednik" => Some("pobednik"),
        "pobjeda" => Some("pobeda"), "pobjednik" => Some("pobednik"), "podela" => Some("podela"),
        "podjela" => Some("podela"), "pogled" => Some("pogled"), "pogreška" => Some("pogreška"),
        "pogrješka" => Some("pogreška"), "poluvreme" => Some("poluvreme"), "poluvrijeme" => Some("poluvreme"),
        "ponedeljak" => Some("ponedeljak"), "ponedjeljak" => Some("ponedeljak"),
        "poreklo" => Some("poreklo"), "porijeklo" => Some("poreklo"), "poseta" => Some("poseta"),
        "posjeta" => Some("poseta"), "posledica" => Some("posledica"), "posljedica" => Some("posledica"),
        "potera" => Some("potera"), "potjera" => Some("potera"), "potreba" => Some("potreba"),
        "poverenje" => Some("poverenje"), "povijest" => Some("povest"), "povjerenje" => Some("poverenje"),
        "povreda" => Some("povreda"), "predlog" => Some("predlog"), "predsednik" => Some("predsednik"),
        "predsedništvo" => Some("predsedništvo"), "predsjednik" => Some("predsednik"),
        "predsjedništvo" => Some("predsedništvo"), "preduzeće" => Some("preduzeće"),
        "pregled" => Some("pregled"), "prekretnica" => Some("prekretnica"), "prelaz" => Some("prelaz"),
        "prelom" => Some("prelom"), "premeštaj" => Some("premeštaj"), "premještaj" => Some("premeštaj"),
        "prenos" => Some("prenos"), "preporod" => Some("preporod"), "prepreka" => Some("prepreka"),
        "presek" => Some("presek"), "presjek" => Some("presek"), "prestup" => Some("prestup"),
        "preteča" => Some("preteča"), "pretnja" => Some("pretnja"), "prevoz" => Some("prevoz"),
        "prevod" => Some("prevod"), "prevodilac" => Some("prevodilac"), "prezir" => Some("prezir"),
        "prijedlog" => Some("predlog"), "prijelaz" => Some("prelaz"), "prijelom" => Some("prelom"),
        "prijenos" => Some("prenos"), "prijestup" => Some("prestup"), "prijetnja" => Some("pretnja"),
        "prijevod" => Some("prevod"), "prijevoz" => Some("prevoz"), "primena" => Some("primena"),
        "primer" => Some("primer"), "primerak" => Some("primerak"), "primjena" => Some("primena"),
        "primjer" => Some("primer"), "primjerak" => Some("primerak"), "pripad" => Some("pripad"),
        "pripovetka" => Some("pripovetka"), "pripovijetka" => Some("pripovetka"),
        "prisebnost" => Some("prisebnost"), "privreda" => Some("privreda"), "procena" => Some("procena"),
        "procenat" => Some("procenat"), "procijeniti" => Some("proceniti"), "procjena" => Some("procena"),
        "proleće" => Some("proleće"), "proljeće" => Some("proleće"), "promena" => Some("promena"),
        "promjena" => Some("promena"), "prosveta" => Some("prosveta"), "prosvjeta" => Some("prosveta"),

        // R
        "raspodela" => Some("raspodela"), "raspodjela" => Some("raspodela"), "rasveta" => Some("rasveta"),
        "rasvjeta" => Some("rasveta"), "razmeštaj" => Some("razmeštaj"), "razmještaj" => Some("razmeštaj"),
        "razumevanje" => Some("razumevanje"), "razumijevanje" => Some("razumevanje"), "reč" => Some("reč"),
        "rečenica" => Some("rečenica"), "reči" => Some("reči"), "rečnik" => Some("rečnik"),
        "red" => Some("red"), "redosled" => Some("redosled"), "redoslijed" => Some("redosled"),
        "reka" => Some("reka"), "rekama" => Some("rekama"), "reke" => Some("reke"),
        "rekom" => Some("rekom"), "reku" => Some("reku"), "rešenje" => Some("rešenje"),
        "rešetka" => Some("rešetka"), "rez" => Some("rez"), "riječ" => Some("reč"),
        "riječi" => Some("reči"), "rijeka" => Some("reka"), "rijekama" => Some("rekama"),
        "rijeke" => Some("reke"), "rijekom" => Some("rekom"), "rijeku" => Some("reku"),
        "rješenje" => Some("rešenje"), "rječnik" => Some("rečnik"), "rođak" => Some("rođak"),

        // S
        "sastanak" => Some("sastanak"), "savest" => Some("savest"), "savet" => Some("savet"),
        "savetnik" => Some("savetnik"), "savjest" => Some("savest"), "savjet" => Some("savet"),
        "savjetnik" => Some("savetnik"), "sazvežđe" => Some("sazvežđe"), "sazviježđe" => Some("sazvežđe"),
        "sećanje" => Some("sećanje"), "sedište" => Some("sedište"), "sednica" => Some("sednica"),
        "sekira" => Some("sekira"), "seme" => Some("seme"), "semenka" => Some("semenka"),
        "sena" => Some("sena"), "senka" => Some("senka"), "seno" => Some("seno"), "seoba" => Some("seoba"),
        "sever" => Some("sever"), "siv" => Some("siv"), "sjećanje" => Some("sećanje"),
        "sjedište" => Some("sedište"), "sjednica" => Some("sednica"), "sjekira" => Some("sekira"),
        "sjeme" => Some("seme"), "sjemenka" => Some("semenka"), "sjena" => Some("sena"),
        "sjenka" => Some("senka"), "sjever" => Some("sever"), "sledbenik" => Some("sledbenik"),
        "slepac" => Some("slepac"), "slepilo" => Some("slepilo"), "slezena" => Some("slezina"),
        "slezina" => Some("slezina"), "slijepac" => Some("slepac"), "sljepilo" => Some("slepilo"),
        "sljedbenik" => Some("sledbenik"), "smeh" => Some("smeh"), "smer" => Some("smer"),
        "smesa" => Some("smesa"), "smeštaj" => Some("smeštaj"), "smetlište" => Some("smetlište"),
        "smetnja" => Some("smetnja"), "smijeh" => Some("smeh"), "smjer" => Some("smer"),
        "smjesa" => Some("smesa"), "smještaj" => Some("smeštaj"), "sneg" => Some("sneg"),
        "sneško" => Some("sneško"), "snijeg" => Some("sneg"), "snješko" => Some("sneško"),
        "sreća" => Some("sreća"), "sreda" => Some("sreda"), "sredina" => Some("sredina"),
        "srem" => Some("srem"), "srijeda" => Some("sreda"), "srijem" => Some("srem"),
        "stena" => Some("stena"), "stene" => Some("stene"), "stijena" => Some("stena"),
        "stijene" => Some("stene"), "strelac" => Some("strelac"), "streljaštvo" => Some("streljaštvo"),
        "strela" => Some("strela"), "strele" => Some("strele"), "strijela" => Some("strela"),
        "strijelac" => Some("strelac"), "strijele" => Some("strele"), "sused" => Some("sused"),
        "susedstvo" => Some("susedstvo"), "susjed" => Some("sused"), "susjedstvo" => Some("susedstvo"),
        "sveća" => Some("sveća"), "svećnjak" => Some("svećnjak"), "svedok" => Some("svedok"),
        "svest" => Some("svest"), "svet" => Some("svet"), "sveta" => Some("sveta"),
        "svetlost" => Some("svetlost"), "svetost" => Some("svetost"), "svetom" => Some("svetom"),
        "svetovi" => Some("svetovi"), "svetu" => Some("svetu"), "svežina" => Some("svežina"),
        "svijest" => Some("svest"), "svijeta" => Some("sveta"), "svijeća" => Some("sveća"),
        "svijećnjak" => Some("svećnjak"), "svijet" => Some("svet"), "svijetom" => Some("svetom"),
        "svijetu" => Some("svetu"), "svjedok" => Some("svedok"), "svjetlost" => Some("svetlost"),
        "svjetovi" => Some("svetovi"), "svježina" => Some("svežina"),

        // T
        "telo" => Some("telo"), "teme" => Some("teme"), "tepih" => Some("tepih"),
        "tesnac" => Some("tesnac"), "testo" => Some("testo"), "težina" => Some("težina"),
        "tijelo" => Some("telo"), "tijesto" => Some("testo"), "tjeme" => Some("teme"),
        "tjesnac" => Some("tesnac"), "tok" => Some("tok"), "treperenje" => Some("treperenje"),
        "trezan" => Some("trezan"), "trijezan" => Some("trezan"),

        // U
        "ubeđenje" => Some("ubeđenje"), "ubjeđenje" => Some("ubeđenje"), "ucena" => Some("ucena"),
        "ucjena" => Some("ucena"), "ugled" => Some("ugled"), "ugljen" => Some("ugljen"),
        "umesto" => Some("umesto"), "umetnost" => Some("umetnost"), "umjesto" => Some("umesto"),
        "umjetnost" => Some("umetnost"), "upotreba" => Some("upotreba"), "uspeh" => Some("uspeh"),
        "uspjeh" => Some("uspeh"), "uteha" => Some("uteha"), "utjeha" => Some("uteha"),
        "uvreda" => Some("uvreda"),

        // V
        "veče" => Some("veče"), "većina" => Some("većina"), "većnik" => Some("većnik"),
        "veće" => Some("veće"), "vek" => Some("vek"), "vekovi" => Some("vekovi"),
        "venac" => Some("venac"), "vera" => Some("vera"), "vernost" => Some("vernost"),
        "vesnik" => Some("vesnik"), "vest" => Some("vest"), "vesti" => Some("vesti"),
        "veštica" => Some("veštica"), "veština" => Some("veština"), "vetar" => Some("vetar"),
        "veverica" => Some("veverica"), "viđenje" => Some("viđenje"), "vijeće" => Some("veće"),
        "vijećnik" => Some("većnik"), "vijek" => Some("vek"), "vijenac" => Some("venac"),
        "vijest" => Some("vest"), "vijesti" => Some("vesti"), "vjekovi" => Some("vekovi"),
        "vjera" => Some("vera"), "vjernost" => Some("vernost"), "vjesnik" => Some("vesnik"),
        "vještica" => Some("veštica"), "vještina" => Some("veština"), "vjetar" => Some("vetar"),
        "vjeverica" => Some("veverica"), "vreća" => Some("vreća"), "vreme" => Some("vreme"),
        "vremena" => Some("vremena"), "vremenu" => Some("vremenu"), "vrijeme" => Some("vreme"),

        // Z
        "zagonetka" => Some("zagonetka"), "zahtev" => Some("zahtev"), "zahtjev" => Some("zahtev"),
        "zakletva" => Some("zakletva"), "zamerka" => Some("zamerka"), "zamjerka" => Some("zamerka"),
        "zanovetanje" => Some("zanovetanje"), "zanovijetanje" => Some("zanovetanje"),
        "zapovest" => Some("zapovest"), "zapovijest" => Some("zapovest"), "zastava" => Some("zastava"),
        "zavesa" => Some("zavesa"), "zavet" => Some("zavet"), "zavist" => Some("zavist"),
        "zavjesa" => Some("zavesa"), "zavjet" => Some("zavet"), "zenica" => Some("zenica"),
        "zet" => Some("zet"), "zjenica" => Some("zenica"), "zrenje" => Some("zrenje"),
        "zreti" => Some("zreti"), "zver" => Some("zver"), "zvezda" => Some("zvezda"),
        "zvezde" => Some("zvezde"), "zvijer" => Some("zver"), "zvijezda" => Some("zvezda"),
        "zvijezde" => Some("zvezde"),

        // Ž
        "ždrebe" => Some("ždrebe"), "ždrijebe" => Some("ždrebe"), "želja" => Some("želja"),
        "žena" => Some("žena"), "život" => Some("život"),

        _ => None,
    }
}
