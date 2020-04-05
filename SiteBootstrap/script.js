$(function() {

    // Id de l'animation
    let ida = 0

    // Top pour savoir si l'animation a déà tourné
    let topa = false

    // temps au début de l'animation
    let st = 0

    // durée max de l'animation
    let dmax = 1000

    // Fonction réalisé durant l'animation
    let fade = (time) => {
        // Duree pendant laquelle l'animation a tournée
        let d = time - st

        $('nav').css('background-color', 'rgb(0, 123, 255, ' + (d / dmax) + ')')
        $('nav').css('box-shadow', '0 ' + (d / dmax * -1) + 'px 20px #9c9c9c')

        // Tant que la durée limite de l'animation a pas été atteind on la relance
        if (d < dmax) requestAnimationFrame(fade)
        else {
            // Si la durée limite est atteinte on stock le temps de fin de l'animation pour la relancer aprés
            st = time
        }
    }

    //$('#board').load('board.html')
    //$('#phone').load('phone.html')
    $('#carousel').load('carousel.html')

    $(document).on('scroll', () => {


        if ($('html').scrollTop() === 0) {
            topa = false
            $('nav').css('background-color', 'rgb(0, 123, 255, 0)')
            $('nav').css('box-shadow', '')
        } else {
            if (!topa) {
                topa = true
                requestAnimationFrame(fade)
            }
        }
    })

    $(document).trigger('scroll')
})