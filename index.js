$( document ).ready(function () {



    
    $('.form-control-color').each(function() {updateColorPicker(this)});
    $('.form-control-color').on('input', function () {
        updateColorPicker(this);
    })  

    $('.form-range').each(function() {updateSlider(this)});
    $('.form-range').on('input', function () {
        updateSlider(this);
    })      
});


function updateSlider(slider) {
    $(slider).parent().find('.rangeValue').text($(slider).val());
}

function updateColorPicker(picker) {
    $(picker).parent().find('.colorValue').text($(picker).val());
}


