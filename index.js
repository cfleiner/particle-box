let particleSize = {
    random: function(baseSize, gray) {
        return Math.max(Math.floor(Math.random() * baseSize));
    },
    gray: function(baseSize, gray) {
        return Math.floor(baseSize - (gray / 255*baseSize))    
    }
}


$( document ).ready(function () {
    // update menu items 
    $('.form-control-color').each(function() {updateColorPicker(this)});
    $('.form-control-color').on('input', function () {
        updateColorPicker(this);
    })  
    $('.form-range').each(function() {updateSlider(this)});
    $('.form-range').on('input', function () {
        updateSlider(this);
    })  

    $('#btn-center').on('click', function () {
        const config = getConfig('.center-ctrl');
        const centerBox = new ParticleBox('#img-canvas', config);
        centerBox.run();
    });

    $('#btn-bg').on('click', function (){ 
        const config = getConfig('.bg-ctrl');
        const backgroundBox = new ParticleBox('#bg-canvas', config);
        backgroundBox.run();
    }); 
    
    $('#btn-bg-download').on('click', function() {
        downloadJSON( getConfig('.bg-ctrl'), "particle-box-config.json");
    });
    
    $('#btn-center-download').on('click', function() {
        downloadJSON( getConfig('.center-ctrl'), "particle-box-config.json");
    });


    // load particle boxes
    const backgroundBox = new ParticleBox('#bg-canvas', getConfig('.bg-ctrl'));
    backgroundBox.run();

    const centerBox = new ParticleBox('#img-canvas', getConfig('.center-ctrl'));
    centerBox.run();

});

function toggleSidebar(id) {
    const sidebar = document.getElementById(id);
    sidebar.classList.toggle('show');
}

function updateSlider(slider) {
    $(slider).parent().find('.rangeValue').text($(slider).val());
}

function updateColorPicker(picker) {
    $(picker).parent().find('.colorValue').text($(picker).val());
}

function getConfig(cls) {
    const config = {
        keepParticleSize: $(cls + '.zoom-keep-size').is(':checked'), 
        keepParticlePopulation: $(cls + '.zoom-keep-population').is(':checked'), 
        poolingSize: $(cls + '.pooling-size').val() ,
        threshold:   $(cls + '.gray-threshold').val(),
        particleSize: $(cls + '.particle-size').val(),
        particleFriction: $(cls + '.particle-friction').val(),
        factor: $(cls + '.gap-factor').val(), 
        grayMethod:  $(cls + '.gray-method').val(),
        poolingMethod: $(cls + '.pooling-method').val(),
        colors :  $(cls + '.colors').val().trim().replace(/,/g, ' ').split(/\s+/),
        bgColor: $(cls + '.bg-color').val(),
    };

    if ($(cls + '.image-url').val().length > 0) {
        config['pathToJPG'] = $(cls + '.image-url').val()
    }
 
    if ($(cls + '.size-function').val() !== 'none') {
        config['particleSizeFunction'] = particleSize[$(cls + '.size-function').val()];
    } 
   
    const arr = $(cls + '.shape').val().split('-')
    config['geometry'] = arr[0]

    if (arr.length > 1) {
        config['pointsDown'] =  (arr[1] === "down");
    }

    return config;
}


function downloadJSON(obj, filename) {
    const jsonStr = JSON.stringify(obj, null, 2); 
    const blob = new Blob([jsonStr], { type: "application/json" }); 
    const url = URL.createObjectURL(blob); 

    const a = $('<a>').attr({
        href: url,
        download: filename
    }).appendTo('body'); 
    
    a[0].click(); 
    a.remove(); 
    URL.revokeObjectURL(url); 
}





