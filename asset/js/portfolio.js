$(document).ready(function () {
	$('.page-scroll').on('click', function (event) {
		event.preventDefault();
		
		var target = $(this).attr('href');
		var elemTarget = $(target);

		$('body').animate({
			scrollTop: elemTarget.offset().top - 50
		}, 1000, 'easeInOutExpo');
	});		
});
