var list = [
	{
		id: 1,
		name: 'Ayam Bakar',
		picture: 'ayam_bakar.jpg',
		price: 15.000,
		status: 1
	},
	{
		id: 2,
		name: 'Ayam Goreng Kelapa',
		picture: 'ayam_goreng_kelapa.jpg',
		price: 15.000,
		status: 1
	},
	{
		id: 3,
		name: 'Ayam Kremes',
		picture: 'ayam_kremes.jpg',
		price: 15.000,
		status: 1
	},
	{
		id: 4,
		name: 'Ayam Rica',
		picture: 'ayam_rica.jpg',
		price: 15.000,
		status: 1
	},
	{
		id: 5,
		name: 'Bebek Bakar',
		picture: 'bebek_bakar.jpg',
		price: 15.000,
		status: 0
	},
	{
		id: 6,
		name: 'Bebek Kremes',
		picture: 'bebek_kremes.jpg',
		price: 15.000,
		status: 1
	},
	{
		id: 7,
		name: 'Bebek Terpedas',
		picture: 'bebek_terpedas.jpg',
		price: 15.000,
		status: 1
	},
	{
		id: 8,
		name: 'Foody Moblie Ayam Bakar',
		picture: 'foody-mobile-ayam-bakar.jpg',
		price: 15.000,
		status: 1
	},
	{
		id: 9,
		name: 'Ikan Lele Kremes Kari',
		picture: 'ikan-lele-kremes-kari.jpg',
		price: 15.000,
		status: 1
	},
	{
		id: 10,
		name: 'Lele Bakar',
		picture: 'lele_bakar.jpg',
		price: 15.000,
		status: 1
	},
	{
		id: 11,
		name: 'Lele Rica',
		picture: 'lele_rica.jpg',
		price: 15.000,
		status: 1
	},
];
var bekalModule = {
	init: function () {
		this.createMenuList(function () {
			bekalModule.listener();
		});
	},
	createMenuList: function (cb) {
		var $container = $('.menu-list-container');

		$container.empty();
		for (var i = 0; i < list.length; i++) {
			var menu = list[i];
			var label = menu.status > 0 ? 'info' : 'danger';
			var status = menu.status > 0 ? 'Ready' : 'Sold Out';
			var menuTemplate =
				'<div class="img-portfolio col-sm-3">' +
		            '<a href="#" class="thumbnail">' +
						'<img class="img-resize" src="assets/img/bekal/'+ menu.picture +'">' +
						'<div class="row detail-product ">' +
			                '<div class="col-md-12"><p class="text-center menu-name">'+ menu.name +'</p><span class="label label-'+ label +'">'+ status +'</span></div>' +
			                '<div class="col-md-6">' +
								'<span class="price">Rp. '+ menu.price.toFixed(3) +',-</span>' +
		                '</div>' +
		                '<div class="col-md-6">' +
							'<button data-menu="'+ menu.id +'" class="btn btn-success buy-button">Pesan</button>' +
		                '</div>' +
		              '</div>' +
		            '</a>' +
				'</div>';

			$container.append(menuTemplate);
		}
		if (typeof cb == 'function') { cb(); }
	},
	book: function () {
		return function () {
			var id = $(this).data('menu');
			var selectedMenu = list.find(function (m) {
				return m.id == id;
			});

			$('#form-book').find('#menu-name-book').text(selectedMenu.name);
			$('#form-book').find('#img-book').attr('src', 'assets/img/bekal/' + selectedMenu.picture);
			$('#form-book').find('#total-book').val(1);
			$('#form-book').find('#total-price').val(selectedMenu.price * 1000).data('price', selectedMenu.price);

			$('#menu-container').fadeOut();
			$('#contact').fadeOut();
			$('.jumbotron').fadeOut();
			$('#book-container').fadeIn();
			$(document).scrollTop(0);
		}
	},
	listener: function () {
		$('.page-scroll').on('click', function (event) {
			event.preventDefault();

			var target = $(this).attr('href');
			var elemTarget = $(target);

			$('body').animate({
				scrollTop: elemTarget.offset().top - 50
			}, 1000, 'easeInOutExpo');
		});

		$('.img-portfolio a').each(function (i, a) {
			$(a).bind('click', function (e) {
				e.preventDefault();
			});
		});

		$('.img-portfolio .buy-button').each(function (i, btn) {
			$(btn).bind('click', bekalModule.book());
		});

		$('.book-cancel, .submit').bind('click', function () {
			if ($(this).text() == 'Pesan') { alert('Sucess') }

			$('#book-container').fadeOut();
			$('#menu-container').fadeIn();
			$('#contact').fadeIn();
			$('.jumbotron').fadeIn();
		});

		var calculatePrice = function () {
			var val = parseInt($(this).val());
			var originPrice = parseInt($('#total-price').data('price'));

			$('#form-book').find('#total-price').val((originPrice * 1000) * val);
		}

		$('#total-book').bind('click keyup', calculatePrice);
	}
};

$(document).ready(function () {
	bekalModule.init();
});
