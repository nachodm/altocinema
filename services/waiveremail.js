module.exports = function waiverTemplate  (language, contact, waiver)  {
    const esp_no_waiver=`<p>Hola ${contact}</p>` +  
    "<p>Nos ponemos en contacto con vosotros desde AltoCinema. Somos una nueva distribuidora de cine independiente con base en Madrid. Tenemos en nuestro catálogo algunas obras que consideramos que encajarían con la línea editorial de vuestro festival y nos gustaría hacéroslas llegar. Nos preguntábamos si sería posible obtener algún tipo de waiver o descuento de las tasas de inscripción.</p>"
    +"<p>Un saludo,</p>"
    +"<p>Antonio Muñoz</p>"
    const eng_no_waiver=`<p>Hello ${contact}</p>` +  
    "<p>We get in touch with you from AltoCinema. We are a new independent film distribution company based in Madrid. We have in our catalogue some movies that we consider would fit with your festival's editorial line, and we would like to send them to you. We were wondering if it would be possible to get a waiver code or discount to cover the fees. </p>"
    +"<p>All the best,</p>"
    +"<p>Antonio Muñoz</p>"
    const esp_waiver=`<p>Hola ${contact}</p>` +  
    "<p>Os escribimos desde Altocinema, distribuidora de cine independiente. Estamos encantados de saludaros nuevamente otro año más. El año pasado os enviamos varias de nuestras obras para participar en el festival gracias a un waiver que nos ofrecisteis. Nos preguntábamos si sería posible recibir uno nuevo este año para poder enviaros nuestras últimas novedades que creemos que pueden encajar con la línea editorial de vuestro festival.</p>"
    +"<p>Un saludo,</p>"
    +"<p>Antonio Muñoz</p>"
    const eng_waiver=`<p>Hello ${contact}</p>` +  
    "<p>We are contacting you from AltoCinema, an independent film distribution company.  We are delighted to greet you again for another year. Last year, we sent you some of our movies to participate in the festival thanks to a waiver that you offered us. We were wondering if it could be possible to receive a new one this year too to be able to send you our latest films that fit with the editorial line of your festival.</p>"
    +"<p>All the best,</p>"
    +"<p>Antonio Muñoz</p>"

    if (waiver === "y1" || waiver === "y2") {
        if(language = "esp") {
            return esp_waiver
        }
        else {
            return eng_waiver
        }
    }
    else if (waiver === "n1") {
        if(language = "esp") {
            return esp_no_waiver
        }
        else {
            return eng_no_waiver
        }
    }

}