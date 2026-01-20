pub fn e2i(word: &str) -> Option<&str> {
    match word {
        // B
        "bežala" => Some("bježala"),
        "bežao" => Some("bježao"),
        "bežati" => Some("bježati"),
        "bežim" => Some("bježim"),

        // C
        "celivati" => Some("cjelivati"),
        "cenim" => Some("cijenim"),
        "ceniti" => Some("cijeniti"),

        // D
        "delovati" => Some("djelovati"),
        "dodeliti" => Some("dodijeliti"),
        "donela" => Some("donijela"),
        "doneli" => Some("donijeli"),
        "doneo" => Some("donio"),
        "doneti" => Some("donijeti"),
        "dopreo" => Some("dopro"),
        "dopreti" => Some("doprijeti"),
        "dospela" => Some("dospjela"),
        "dospeo" => Some("dospio"),
        "dospeti" => Some("dospjeti"),
        "doživeti" => Some("doživjeti"),
        "dremati" => Some("drijemati"),

        // G
        "grejati" => Some("grijati"),

        // H
        "htela" => Some("htjela"),
        "htele" => Some("htjele"),
        "hteli" => Some("htjeli"),
        "htelo" => Some("htjelo"),
        "hteo" => Some("htio"),
        "hteti" => Some("htjeti"),

        // I
        "isecati" => Some("isjecati"),
        "iseći" => Some("isjeći"),
        "isceliti" => Some("iscijeliti"),
        "izlečiti" => Some("izliječiti"),
        "izmeniti" => Some("izmijeniti"),
        "iznela" => Some("iznijela"),
        "izneo" => Some("iznio"),
        "izneti" => Some("iznijeti"),
        "izvestiti" => Some("izvijestiti"),

        // L
        "lečiti" => Some("liječiti"),
        "letela" => Some("letjela"),
        "leteo" => Some("letio"),
        "letelo" => Some("letjelo"),
        "leteti" => Some("letjeti"),
        "liti" => Some("liti"),

        // M
        "meriti" => Some("mjeriti"),
        "mešati" => Some("miješati"),

        // N
        "nagovestiti" => Some("nagovijestiti"),
        "nameravati" => Some("namjeravati"),
        "naslediti" => Some("naslijediti"),

        // O
        "obećati" => Some("obećati"),
        "odnela" => Some("odnijela"),
        "odneo" => Some("odnio"),
        "odneti" => Some("odnijeti"),
        "odoleti" => Some("odoljeti"),
        "odseći" => Some("odsjeći"),
        "okrevati" => Some("oklijevati"),
        "opremiti" => Some("opremiti"),
        "osetiti" => Some("osjetiti"),
        "osmehnuti" => Some("osmjehnuti"),
        "oteti" => Some("oteti"),
        "ozlediti" => Some("ozlijediti"),
        "oživeti" => Some("oživjeti"),

        // P
        "pevati" => Some("pjevati"),
        "pleniti" => Some("plijeniti"),
        "pobeći" => Some("pobjeći"),
        "pobediti" => Some("pobijediti"),
        "podeliti" => Some("podijeliti"),
        "podneo" => Some("podnio"),
        "podneti" => Some("podnijeti"),
        "ponela" => Some("ponijela"),
        "poneo" => Some("ponio"),
        "poneti" => Some("ponijeti"),
        "posedeti" => Some("posjedjeti"),
        "posetiti" => Some("posjetiti"),
        "poveriti" => Some("povjeriti"),
        "prenela" => Some("prenijela"),
        "preneo" => Some("prenio"),
        "preneti" => Some("prenijeti"),
        "pretiti" => Some("prijetiti"),
        "primeniti" => Some("primijeniti"),
        "pripovedati" => Some("pripovijedati"),
        "proceniti" => Some("procijeniti"),
        "promeniti" => Some("promijeniti"),

        // R
        "razumela" => Some("razumjela"),
        "razumelo" => Some("razumjelo"),
        "razumeo" => Some("razumio"),
        "razumeti" => Some("razumjeti"),
        "rešiti" => Some("riješiti"),

        // S
        "savetovati" => Some("savjetovati"),
        "sazreti" => Some("sazreti"),
        "sedela" => Some("sjedila"),
        "sedelo" => Some("sjedilo"),
        "sedeo" => Some("sjedio"),
        "sedeti" => Some("sjedjeti"),
        "seći" => Some("sjeći"),
        "setiti" => Some("sjetiti"),
        "smejati" => Some("smijati"),
        "smela" => Some("smjela"),
        "smeli" => Some("smjeli"),
        "smelo" => Some("smjelo"),
        "smeo" => Some("smio"),
        "smeš" => Some("smiješ"),
        "smestiti" => Some("smjestiti"),
        "smetati" => Some("smetati"),
        "smeti" => Some("smjeti"),
        "stidela" => Some("stidjela"),
        "stideo" => Some("stidio"),
        "stideti" => Some("stidjeti"),
        "svedočiti" => Some("svjedočiti"),

        // T
        "trčati" => Some("trčati"),
        "trebati" => Some("trebati"),
        "trezniti" => Some("trijezniti"),
        "trpeti" => Some("trpjeti"),

        // U
        "ubediti" => Some("ubijediti"),
        "uleteti" => Some("uletjeti"),
        "uleti" => Some("uleti"),
        "umela" => Some("umjela"),
        "umelo" => Some("umjelo"),
        "umem" => Some("umijem"),
        "umeo" => Some("umio"),
        "umeti" => Some("umjeti"),
        "unela" => Some("unijela"),
        "uneo" => Some("unio"),
        "uneti" => Some("unijeti"),
        "uspela" => Some("uspjela"),
        "uspeo" => Some("uspio"),
        "uspeti" => Some("uspjeti"),
        "utešiti" => Some("utješiti"),
        "uvrediti" => Some("uvrijediti"),

        // V
        "verovala" => Some("vjerovala"),
        "verovao" => Some("vjerovao"),
        "verovati" => Some("vjerovati"),
        "videla" => Some("vidjela"),
        "videle" => Some("vidjele"),
        "videli" => Some("vidjeli"),
        "videlo" => Some("vidjelo"),
        "video" => Some("vidio"),
        "videti" => Some("vidjeti"),
        "volela" => Some("voljela"),
        "voleo" => Some("volio"),
        "voleti" => Some("voljeti"),
        "vredela" => Some("vrijedila"),
        "vredelo" => Some("vrijedilo"),
        "vredeo" => Some("vrijedio"),
        "vredeti" => Some("vrijedjeti"),

        // Z
        "zameriti" => Some("zamjeriti"),
        "zavidela" => Some("zavidjela"),
        "zavideo" => Some("zavidio"),
        "zavideti" => Some("zavidjeti"),
        "zreti" => Some("zreti"),

        // Ž
        "želela" => Some("željela"),
        "želeo" => Some("želio"),
        "želeti" => Some("željeti"),
        "živela" => Some("živjela"),
        "živelo" => Some("živjelo"),
        "živeo" => Some("živio"),
        "živeti" => Some("živjeti"),

        _ => None,
    }
}

pub fn i2e(word: &str) -> Option<&str> {
    match word {
        // B
        "bežati" => Some("bežati"), "bežim" => Some("bežim"),
        "bježala" => Some("bežala"), "bježao" => Some("bežao"),
        "bježati" => Some("bežati"), "bježim" => Some("bežim"),
        "bjeliti" => Some("beliti"),

        // C
        "celivati" => Some("celivati"), "ceniti" => Some("ceniti"),
        "cijenim" => Some("cenim"), "cijeniti" => Some("ceniti"),
        "cijepati" => Some("cepati"), "cijepam" => Some("cepam"),
        "cjelivati" => Some("celivati"),

        // D
        "delovati" => Some("delovati"), "dodeliti" => Some("dodeliti"),
        "djelovati" => Some("delovati"), "dodijeliti" => Some("dodeliti"),
        "donela" => Some("donela"), "doneli" => Some("doneli"),
        "doneo" => Some("doneo"), "doneti" => Some("doneti"),
        "donijela" => Some("donela"), "donijeli" => Some("doneli"),
        "donijeti" => Some("doneti"), "donio" => Some("doneo"),
        "donjela" => Some("donela"), "donjeti" => Some("doneti"),
        "dopreo" => Some("dopreo"), "dopreti" => Some("dopreti"),
        "doprijeti" => Some("dopreti"), "dopro" => Some("dopreo"),
        "dospela" => Some("dospela"), "dospeo" => Some("dospeo"),
        "dospeti" => Some("dospeti"), "dospjela" => Some("dospela"),
        "dospio" => Some("dospeo"), "dospjeti" => Some("dospeti"),
        "doživeti" => Some("doživeti"), "doživjeti" => Some("doživeti"),
        "dremati" => Some("dremati"), "drijemati" => Some("dremati"),

        // G
        "grejati" => Some("grejati"), "grijati" => Some("grejati"),

        // H
        "htela" => Some("htela"), "htele" => Some("htele"),
        "hteli" => Some("hteli"), "htelo" => Some("htelo"),
        "hteo" => Some("hteo"), "hteti" => Some("hteti"),
        "htjela" => Some("htela"), "htjele" => Some("htele"),
        "htjeli" => Some("hteli"), "htjelo" => Some("htelo"),
        "htio" => Some("hteo"), "htjeti" => Some("hteti"),

        // I
        "isecati" => Some("isecati"), "iseći" => Some("iseći"),
        "isceliti" => Some("isceliti"), "iscijeliti" => Some("isceliti"),
        "isjecati" => Some("isecati"), "isjeći" => Some("iseći"),
        "izlečiti" => Some("izlečiti"), "izliječiti" => Some("izlečiti"),
        "izmeniti" => Some("izmeniti"), "izmijeniti" => Some("izmeniti"),
        "iznela" => Some("iznela"), "izneo" => Some("izneo"),
        "izneti" => Some("izneti"), "iznijela" => Some("iznela"),
        "iznijeti" => Some("izneti"), "iznio" => Some("izneo"),
        "izvestiti" => Some("izvestiti"), "izvijestiti" => Some("izvestiti"),

        // L
        "lečiti" => Some("lečiti"), "letela" => Some("letela"),
        "leteo" => Some("leteo"), "letelo" => Some("letelo"),
        "leteti" => Some("leteti"), "letjela" => Some("letela"),
        "letjelo" => Some("letelo"), "letio" => Some("leteo"),
        "letjeti" => Some("leteti"), "liječiti" => Some("lečiti"),
        "liti" => Some("liti"),

        // M
        "meriti" => Some("meriti"), "mešati" => Some("mešati"),
        "miješati" => Some("mešati"), "mjeriti" => Some("meriti"),

        // N
        "nagovestiti" => Some("nagovestiti"), "nagovijestiti" => Some("nagovestiti"),
        "nameravati" => Some("nameravati"), "namjeravati" => Some("nameravati"),
        "naslediti" => Some("naslediti"), "naslijediti" => Some("naslediti"),

        // O
        "obećati" => Some("obećati"), "odnela" => Some("odnela"),
        "odneo" => Some("odneo"), "odneti" => Some("odneti"),
        "odnijela" => Some("odnela"), "odnijeti" => Some("odneti"),
        "odnio" => Some("odneo"), "odnjeti" => Some("odneti"),
        "odoleti" => Some("odoleti"), "odoljeti" => Some("odoleti"),
        "odseći" => Some("odseći"), "odsjeći" => Some("odseći"),
        "oklijevati" => Some("okrevati"), "okrevati" => Some("okrevati"),
        "opremiti" => Some("opremiti"), "osetiti" => Some("osetiti"),
        "osjetiti" => Some("osetiti"), "osmehnuti" => Some("osmehnuti"),
        "osmjehnuti" => Some("osmehnuti"), "oteti" => Some("oteti"),
        "ozlediti" => Some("ozlediti"), "ozlijediti" => Some("ozlediti"),
        "oživeti" => Some("oživeti"), "oživjeti" => Some("oživeti"),

        // P
        "pevati" => Some("pevati"), "pjevati" => Some("pevati"),
        "pleniti" => Some("pleniti"), "plijeniti" => Some("pleniti"),
        "pobeći" => Some("pobeći"), "pobediti" => Some("pobediti"),
        "pobijediti" => Some("pobediti"), "pobjeći" => Some("pobeći"),
        "podeliti" => Some("podeliti"), "podijeliti" => Some("podeliti"),
        "podneo" => Some("podneo"), "podneti" => Some("podneti"),
        "podnijeti" => Some("podneti"), "podnio" => Some("podneo"),
        "ponela" => Some("ponela"), "poneo" => Some("poneo"),
        "poneti" => Some("poneti"), "ponijela" => Some("ponela"),
        "ponijeti" => Some("poneti"), "ponio" => Some("poneo"),
        "ponjeti" => Some("poneti"), "posedeti" => Some("posedeti"),
        "posetiti" => Some("posetiti"), "posjedjeti" => Some("posedeti"),
        "posjetiti" => Some("posetiti"), "poveriti" => Some("poveriti"),
        "povjeriti" => Some("poveriti"), "prenela" => Some("prenela"),
        "preneo" => Some("preneo"), "preneti" => Some("preneti"),
        "prenijela" => Some("prenela"), "prenijeti" => Some("preneti"),
        "prenio" => Some("preneo"), "pretiti" => Some("pretiti"),
        "prijetiti" => Some("pretiti"), "primeniti" => Some("primeniti"),
        "primijeniti" => Some("primeniti"), "pripovedati" => Some("pripovedati"),
        "pripovijedati" => Some("pripovedati"), "proceniti" => Some("proceniti"),
        "procijeniti" => Some("proceniti"), "promeniti" => Some("promeniti"),
        "promijeniti" => Some("promeniti"),

        // R
        "razumela" => Some("razumela"), "razumelo" => Some("razumelo"),
        "razumeo" => Some("razumeo"), "razumeti" => Some("razumeti"),
        "razumio" => Some("razumeo"), "razumjela" => Some("razumela"),
        "razumjelo" => Some("razumelo"), "razumjeti" => Some("razumeti"),
        "rešiti" => Some("rešiti"), "riješiti" => Some("rešiti"),

        // S
        "savetovati" => Some("savetovati"), "savjetovati" => Some("savetovati"),
        "sazreti" => Some("sazreti"), "sedela" => Some("sedela"),
        "sedelo" => Some("sedelo"), "sedeo" => Some("sedeo"),
        "sedeti" => Some("sedeti"), "seći" => Some("seći"),
        "setiti" => Some("setiti"), "sjedjeti" => Some("sedeti"),
        "sjedila" => Some("sedela"), "sjedilo" => Some("sedelo"),
        "sjedio" => Some("sedeo"), "sjeći" => Some("seći"),
        "sjetiti" => Some("setiti"), "smejati" => Some("smejati"),
        "smela" => Some("smela"), "smeli" => Some("smeli"),
        "smelo" => Some("smelo"), "smeo" => Some("smeo"),
        "smetati" => Some("smetati"), "smeti" => Some("smeti"),
        "smeš" => Some("smeš"), "smijati" => Some("smejati"),
        "smiješ" => Some("smeš"), "smio" => Some("smeo"),
        "smjela" => Some("smela"), "smjeli" => Some("smeli"),
        "smjelo" => Some("smelo"), "smjeti" => Some("smeti"),
        "smjestiti" => Some("smestiti"), "smestiti" => Some("smestiti"),
        "stidela" => Some("stidela"), "stideo" => Some("stideo"),
        "stideti" => Some("stideti"), "stidjela" => Some("stidela"),
        "stidio" => Some("stideo"), "stidjeti" => Some("stideti"),
        "svedočiti" => Some("svedočiti"), "svjedočiti" => Some("svedočiti"),

        // T
        "trčati" => Some("trčati"), "trebati" => Some("trebati"),
        "trezniti" => Some("trezniti"), "trijezniti" => Some("trezniti"),
        "trpeti" => Some("trpeti"), "trpjeti" => Some("trpeti"),

        // U
        "ubediti" => Some("ubediti"), "ubijediti" => Some("ubediti"),
        "uleteti" => Some("uleteti"), "uleti" => Some("uleti"),
        "uletjeti" => Some("uleteti"), "umela" => Some("umela"),
        "umelo" => Some("umelo"), "umem" => Some("umem"),
        "umeo" => Some("umeo"), "umeti" => Some("umeti"),
        "umijem" => Some("umem"), "umjela" => Some("umela"),
        "umjelo" => Some("umelo"), "umjeti" => Some("umeti"),
        "umio" => Some("umeo"), "unela" => Some("unela"),
        "uneo" => Some("uneo"), "uneti" => Some("uneti"),
        "unijela" => Some("unela"), "unijeti" => Some("uneti"),
        "unio" => Some("uneo"), "uspela" => Some("uspela"),
        "uspeo" => Some("uspeo"), "uspeti" => Some("uspeti"),
        "uspjela" => Some("uspela"), "uspjeti" => Some("uspeti"),
        "uspio" => Some("uspeo"), "utešiti" => Some("utešiti"),
        "utješiti" => Some("utešiti"), "uvrediti" => Some("uvrediti"),
        "uvrijediti" => Some("uvrediti"),

        // V
        "verovala" => Some("verovala"), "verovao" => Some("verovao"),
        "verovati" => Some("verovati"), "videla" => Some("videla"),
        "videle" => Some("videle"), "videli" => Some("videli"),
        "videlo" => Some("videlo"), "video" => Some("video"),
        "videti" => Some("videti"), "vidjela" => Some("videla"),
        "vidjele" => Some("videle"), "vidjeli" => Some("videli"),
        "vidjelo" => Some("videlo"), "vidio" => Some("video"),
        "vidjeti" => Some("videti"), "vjerovala" => Some("verovala"),
        "vjerovati" => Some("verovati"), "vjerovao" => Some("verovao"),
        "volela" => Some("volela"), "voleo" => Some("voleo"),
        "voleti" => Some("voleti"), "voljela" => Some("volela"),
        "voljeti" => Some("voleti"), "volio" => Some("voleo"),
        "vredela" => Some("vredela"), "vredelo" => Some("vredelo"),
        "vredeo" => Some("vredeo"), "vredeti" => Some("vredeti"),
        "vrijedila" => Some("vredela"), "vrijedilo" => Some("vredelo"),
        "vrijedio" => Some("vredeo"), "vrijedjeti" => Some("vredeti"),

        // Z
        "zameriti" => Some("zameriti"), "zamjeriti" => Some("zameriti"),
        "zavidela" => Some("zavidela"), "zavideo" => Some("zavideo"),
        "zavideti" => Some("zavideti"), "zavidjela" => Some("zavidela"),
        "zavidio" => Some("zavideo"), "zavidjeti" => Some("zavideti"),
        "zreti" => Some("zreti"),

        // Ž
        "želela" => Some("želela"), "želeo" => Some("želeo"),
        "želeti" => Some("želeti"), "željela" => Some("želela"),
        "željeti" => Some("želeti"), "želio" => Some("želeo"),
        "živela" => Some("živela"), "živelo" => Some("živelo"),
        "živeo" => Some("živeo"), "živeti" => Some("živeti"),
        "živjela" => Some("živela"), "živjelo" => Some("živelo"),
        "živjeti" => Some("živeti"), "živio" => Some("živeo"),

        _ => None,
    }
}
