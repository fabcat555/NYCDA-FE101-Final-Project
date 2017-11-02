const sia = {
    init: function() {        
        fetch('https://scary-zombie-81366.herokuapp.com/superheroes/')
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            $.each(response, function (i, superhero) { 
                const superheroDiv = $('<div>', {
                    class: "col-lg-3 col-md-4 col-sm-6 col-xs-12 team-item",
                    id: superhero.name.split(' ').join('-').toLowerCase(),
                    "data-price": superhero.price,
                    "data-desc": superhero.description
                });
                const superheroImg = $('<img>', {
                    src: "img/superheroes/" + superhero.path,
                    alt: superhero.name,
                    class: "img-responsive img-thumbnail",
                });
                const superheroCaptionDiv = $('<div>', {
                    class: "caption"
                })
                const superheroCaptionTitle = $('<h4>', {
                    text: superhero.name
                });
                
                superheroDiv.append(superheroImg).append(superheroCaptionDiv.append(superheroCaptionTitle));
                superheroDiv.click(sia.openHireModal);
                $("#team-gallery").append(superheroDiv);
            });
        })
        .catch(function(error) {
            throw Error(error);
            $('#noresults-msg').show();
        });
    },
    
    /* Triggers modal on team gallery's items */
    openHireModal: function() {
        $('#modal-sh').modal('toggle', $(this));
    },
    
    /* Vertically center modal inside the window */
    repositionModal: function(modal) {
        dialog = modal.find('.modal-dialog');
        modal.css('display', 'block');
        
        // Sets a margin top to the modal based on the window height
        const factor = $(window).height() < 768 ? 2 : 3;
        dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / factor));
    },
    
    /* Populates modal with superhero image and description */
    populateModal: function(e) {
        const modal = $(this);
        
        const superheroDiv = $(e.relatedTarget); // Element that triggered the modal
        const superheroName = superheroDiv.find('.caption').text();
        const superheroDesc = superheroDiv.data('desc');
        const superheroImg = superheroDiv.find('img').attr('src');
        
        modal.find('.modal-title').text(superheroName); // Set modal title
        modal.find('img').attr('src', superheroImg); // Set image
        modal.find('#sh-desc').text(superheroDesc); // Set description
        
        // Unbind previous click event and set a new one (avoids duplicating)
        modal.find('.sh-hire').unbind().one('click', function() {
            sia.addToHired(e);
        });
        
        sia.repositionModal(modal);
    },
    
    /* Handles click event on team gallery's items */
    addToHired: function(e) {
        const superhero = $(e.relatedTarget);
        
        // Disable click and reduce opacity
        superhero.off('click');
        superhero.addClass('disabled');
        
        const superheroDiv = $('<div>', {
            class: "col-lg-2 col-md-4 col-sm-6 col-xs-12 hired-item",
            id: superhero.attr('id'),
            "data-price": superhero.data('price')
        });
        const superheroImg = $('<img>', {
            src: superhero.find('img').attr('src'),
            alt: superhero.find('img').attr('alt'),
            class: 'img-responsive img-thumbnail hired-img new-hired',
        });
        const imgOverlay = $('<div>', {
            class: 'img-overlay'
        });
        const removeButton = $('<div>', {
            class: 'remove-button',
            text: 'Remove',
            "data-target": superhero.attr('id')
        });
        
        superheroDiv.hide().append(superheroImg).append(imgOverlay.append(removeButton)).fadeIn().css('display', 'inline');
        setTimeout(function() {
            superheroImg.removeClass('new-hired');
        }, 500);
        removeButton.click(sia.removeFromHired);
        
        $('#hired-gallery').append(superheroDiv);
        sia.scrollGallery();
        sia.updateTotal();
        $('#modal-sh').modal('hide');
    },
    
    /* Handles click on Remove button (#hire-us section) */
    removeFromHired: function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Get the parent div element via the data-id attribute
        const superheroDiv = $(this).parents().find(`.hired-item#${$(this).data('target')}`);
        
        // Re-enable click event on team gallery section item (and reset its opacity)
        const parentItem = $(`.team-item#${$(this).data('target')}`);
        parentItem.click(sia.openHireModal); 
        parentItem.removeClass('disabled');
        
        superheroDiv.animate({
            opacity: 0,
            marginLeft: '-200px'
        }, 'slow', function() {
            superheroDiv.remove();
            sia.updateTotal();
        })
    },
    
    /* Scrolls hired gallery to the right */
    scrollGallery: function() {
        const leftPos = $('#quote-hired').scrollLeft();
        $("#quote-hired").animate({scrollLeft: leftPos + 250}, 800);
    },
    
    /* Updates quote total (#hire-us section) */
    updateTotal: function() {
        const hiredItems = $('.hired-item');
        let total = 0;
        
        $.each(hiredItems, function () { 
            total += $(this).data('price');
        });
        
        const daysInput = parseInt($('#days').val());
        const days = isNaN(daysInput) ? 0 : daysInput;
        
        if (days >= 0 && days <= 1000) {
            $('#quote-error').hide();
            $('#total-price').text(`$ ${(total*days).toFixed(2)}`).hide().fadeIn();
        }
        else {
            $('#total-price').hide();
            $('#quote-error').show();
        }
    },
    
    /* Clears search box and triggers input change event */
    clearSearch: function() {
        $('#search-term').val('');
        $('#search-term').trigger('change');
    },
    
    /* Filters out the .team-item divs based on a search term */
    searchSuperhero: function(e) {
        const searchTerm = $(e.target).val();
        let matches = 0;
        
        $(".team-item").each(function() {
            // Search inside the current div a word matching the search term.
            // RegExp's "i" flag ignores case
            if ($(this).text().search(new RegExp(searchTerm, "i")) < 0) {
                $(this).fadeOut();
            } else {
                $(this).show();
                matches++;
            }
        });
        
        if (matches === 0) {
            $('#noresults-msg').show();
        }
        else {
            $('#noresults-msg').hide();
        }
    },
    
    /* Removes focus from navbar toggle */
    blurNavbar: function () {
        $('.navbar-toggle').blur();
    },
    
    /* Collapses navigation menu */
    collapseNavbar: function (e) { 
        $('#nav-menu').collapse('hide');
    },
    
    /* Handles touch event on mobile (collapses navbar if expanded) */
    touchEvent: function() {
        const isNavbarCollapsed = $('.navbar-toggle').attr('aria-expanded');
        if (isNavbarCollapsed) {
            $('#nav-menu').collapse('hide');
        }
    }
};

$(document).ready(function(e) {
    
    /* Init app */
    sia.init();
    
    /* Sets callback on search box input change */
    $('#search-term').on('change keyup cut paste input', sia.searchSuperhero);
    
    /* Sets modal open callback */
    $('#modal-sh').on('show.bs.modal', sia.populateModal);
    
    /* Sets callback on search box's clear button click */
    $('#clear-btn').on('click', sia.clearSearch);
    
    /* Sets callback on days input update (#quote-total) */
    $('#days').on('change keyup cut paste input', sia.updateTotal);
    
    /* Callbacks for navbar behavior */
    $('#nav-menu').on('hidden.bs.collapse', sia.blurNavbar);
    $('.navbar-toggle').on('blur', sia.collapseNavbar);
    
    /* Handles click outside of navbar on mobile */
    $(document).on('touchstart', sia.touchEvent);
});