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
    deadline DATE NOT NULL,
    fest_type TINYINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    edition_year INT NOT NULL,
    country VARCHAR(255) NOT NULL,
    init_date DATE NOT NULL,
    end_date DATE NOT NULL,
    web VARCHAR(255) NOT NULL,
    taxfree BOOLEAN NOT NULL DEFAULT FALSE,
    envio0 BOOLEAN NOT NULL DEFAULT FALSE,
    envio1 BOOLEAN NOT NULL DEFAULT FALSE,    
    envio2 BOOLEAN NOT NULL DEFAULT FALSE,
    envio4 BOOLEAN NOT NULL DEFAULT FALSE,
    envio1fee BOOLEAN NOT NULL DEFAULT FALSE,    
    envio2fee BOOLEAN NOT NULL DEFAULT FALSE,
    enviono BOOLEAN NOT NULL DEFAULT FALSE,
    platform_id INT NOT NULL,
    CONSTRAINT FK_platform FOREIGN KEY (platform_id) REFERENCES PLATFORMS (id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (festival_id)
    -- specify more columns here
);

CREATE TABLE FILMCATEGORIES (
    id INT NOT NULL AUTO_INCREMENT,
    category VARCHAR(255) NOT NULL,
    primary key(id, category)
    -- specify more columns here
);

CREATE TABLE PLATFORM(
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY(id)
)

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
    CONSTRAINT FK_festival FOREIGN KEY (festival_id) REFERENCES FESTIVALS (festival_id) ON DELETE CASCADE ON UPDATE CASCADE

 )