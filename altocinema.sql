CREATE TABLE USERS (
    email VARCHAR (255) NOT NULL PRIMARY KEY, -- primary key column
    pass VARCHAR (255) NOT NULL,
    name VARCHAR(255) DEFAULT NULL
    -- specify more columns here
);

CREATE TABLE FILMS (
    id INT NOT NULL AUTO_INCREMENT, -- primary key column
    title VARCHAR(255) NOT NULL,
    engtitle VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    date DATE NOT NULL,
    color VARCHAR(50) NOT NULL,
    animationtechnique VARCHAR(255) DEFAULT NULL,
    originalv VARCHAR(255) NOT NULL,
    genre VARCHAR(255) DEFAULT NULL,
    duration INT NOT NULL,
    country VARCHAR(255) NOT NULL,
    screen VARCHAR(255) NOT NULL,
    shootingplace VARCHAR(255) NOT NULL,
    catalogue VARCHAR(255) NOT NULL,
    sinopsis VARCHAR(510) DEFAULT NULL,
    eng_sinopsis VARCHAR(510) DEFAULT NULL,
    materialslink VARCHAR(2083) DEFAULT NULL,
    link VARCHAR(2083) DEFAULT NULL,
    originalvimeo VARCHAR(2083) DEFAULT NULL,
    englishvimeo VARCHAR(2083) DEFAULT NULL,
    frenchvimeo VARCHAR(2083) DEFAULT NULL,
    italianvimeo VARCHAR(2083) DEFAULT NULL,
    spavimeo VARCHAR(2083) DEFAULT NULL,
    trailer VARCHAR(2083) DEFAULT NULL,
    trailereng VARCHAR(2083) DEFAULT NULL,
    director VARCHAR(255) NOT NULL,
    script VARCHAR(255) DEFAULT NULL,
    photography VARCHAR(255) DEFAULT NULL,
    artistic VARCHAR(255) DEFAULT NULL,
    soundtrack VARCHAR(255) DEFAULT NULL,
    montage VARCHAR(255) NOT NULL,
    producer VARCHAR(255) NOT NULL,
    animation VARCHAR(255) DEFAULT NULL,
    sound VARCHAR(255) DEFAULT NULL,
    interpreter VARCHAR(255) DEFAULT NULL,
    copiesheader VARCHAR(255) DEFAULT NULL,
    copiesstreet VARCHAR(255) DEFAULT NULL,
    copiescp VARCHAR(255) DEFAULT NULL,
    copiestel VARCHAR(255) DEFAULT NULL,
    copiescity VARCHAR(255) DEFAULT NULL,
    copiesprovince VARCHAR(255) DEFAULT NULL,
    copiescountry VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id)
    -- specify more columns here
);

CREATE TABLE DIRECTORS (
    id INT NOT NULL AUTO_INCREMENT, -- primary key column
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id)
    -- specify more columns here
);
 
 CREATE TABLE FESTIVALS (
    festival_id INT NOT NULL AUTO_INCREMENT, -- primary key column
    name VARCHAR(255) NOT NULL,
    ok TINYINT NOT NULL,
    init_date DATE NOT NULL,
    end_date DATE NOT NULL,
    edition INT NOT NULL,
    deadline DATE NOT NULL,
    type TINYINT NOT NULL,
    entryfee BOOLEAN NOT NULL DEFAULT TRUE,
    fee INT NOT NULL,
    currency VARCHAR(256) NOT NULL,
    platform VARCHAR(256) NOT NULL,
    prize BOOLEAN DEFAULT FALSE,
    contactname VARCHAR(128),
    contact_email VARCHAR(256),
    programmer VARCHAR(128),
    prog_email VARCHAR(256),
    contact_tel VARCHAR(64),
    contact_web VARCHAR(256),
    platformurl VARCHAR(256),
    state VARCHAR(256),
    contactcountry VARCHAR(256),
    language VARCHAR(256),
    notes VARCHAR(2048),
    confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    sheet VARCHAR(255),
    shortname VARCHAR(255) NOT NULL,
    header VARCHAR(255),
    street VARCHAR(255),
    postalcode INT,    
    city BOOLEAN NOT NULL DEFAULT FALSE,
    province BOOLEAN NOT NULL DEFAULT FALSE,
    copies_header VARCHAR(255),
    copies_street VARCHAR(255),
    copies_cp VARCHAR(255),
    copies_tel VARCHAR(255),
    copies_city VARCHAR(255),
    copies_province VARCHAR(255),
    copies_country VARCHAR(255),
    PRIMARY KEY (festival_id)
    -- specify more columns here
);

CREATE TABLE FILMCATEGORIES (
    id INT NOT NULL,
    category VARCHAR(255) NOT NULL,
    CONSTRAINT FK_id FOREIGN KEY (id) REFERENCES FILMS (id) ON DELETE CASCADE ON UPDATE CASCADE,
    primary key(id, category)
    -- specify more columns here
);

CREATE TABLE FESTIVALCATEGORIES (
    id INT NOT NULL,
    category VARCHAR(255) NOT NULL,
    CONSTRAINT FK_festival_id FOREIGN KEY (id) REFERENCES FESTIVALS (festival_id) ON DELETE CASCADE ON UPDATE CASCADE,
    primary key(id, category)
    -- specify more columns here
);

CREATE TABLE CONNECTFILMCATEGORIES ( 
    category_id VARCHAR(255) NOT NULL,
    film_id VARCHAR(255) NOT NULL,
    PRIMARY KEY(category_id, film_id),
    CONSTRAINT FK_category FOREIGN KEY (category_id) REFERENCES FILMCATEGORIES (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_film FOREIGN KEY (film_id) REFERENCES FILMS (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE CONNECTFESTIVALCATEGORIES ( 
    category_id VARCHAR(255) NOT NULL,
    festival_id VARCHAR(255) NOT NULL,
    PRIMARY KEY(category_id, festival_id),
    CONSTRAINT FK_category FOREIGN KEY (category_id) REFERENCES FILMCATEGORIES (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_festival FOREIGN KEY (festival_id) REFERENCES FESTIVALS (festival_id) ON DELETE CASCADE ON UPDATE CASCADE
);

 CREATE TABLE PRESINSCR (
    film_id,
    festival_id,
    PRIMARY KEY(film_id, festival_id),
    CONSTRAINT FK_film FOREIGN KEY (film_id) REFERENCES FILMS (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_festival FOREIGN KEY (festival_id) REFERENCES FESTIVALS (festival_id) ON DELETE CASCADE ON UPDATE CASCADE+
 )