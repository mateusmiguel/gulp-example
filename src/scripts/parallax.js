// Parallax 

$(document).ready(function () {
	$('[data-type="parallax"]').each(function () {
		var el = $(this);
		$(window).bind('scroll', function () {
			var scrollTop = $(window).scrollTop();
			var elementOffset = el.offset().top;
			var currentElementOffset = (elementOffset - scrollTop);
			var yPos = (currentElementOffset / el.data('speed'));
			var coords = '50% ' + yPos + 'px';
			el.css({
				backgroundPosition: coords
			});
		});
	});
});