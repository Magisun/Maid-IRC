window.onbeforeunload = function () {
	return "You have attempted to leave this page. Doing so will disconnect you from IRC.";
};

selectAll('#sidebar header ul li')[0].onclick = function () {
	select('#sidebar header ul').classList.remove('displayed');
	select("#pageCover").classList.toggle("displayed");
	select("#settings").classList.toggle("displayed");
};

selectAll('#settings.modal header button')[0].onclick = function () {
	select("#pageCover").classList.toggle("displayed");
	select("#settings").classList.toggle("displayed");
};

selectAll('#sidebar header ul li')[1].onclick = function () {
	select('#sidebar header ul').classList.remove('displayed');
	select("#pageCover").classList.toggle("displayed");
	select("#shutdown").classList.toggle("displayed");
};

select("#pageCover").onclick = function () {
	select("#pageCover").classList.remove("displayed");
	[].map.call(selectAll(".modal"), function(obj) {
		obj.classList.remove("displayed");
	});
};

select("#shutdown.modal.alert button").onclick = function () {
	select("#pageCover").classList.toggle("displayed");
	select("#shutdown").classList.toggle("displayed");
};

selectAll("#shutdown.modal.alert button")[1].onclick = function () {
	socket.emit('shutdown', {});
	window.onbeforeunload = null;
	window.location.href = document.location.origin;
};

select('html').onclick = function () {
	select('#sidebar header ul').classList.remove("displayed");
};

select('#sidebar header ul').onclick = function (event) {
	event.stopPropagation();
};

select('#sidebar header button').onclick = function () {
	event.stopPropagation();
	select('#sidebar header ul').classList.toggle('displayed');
};

// Settings
var settingsItems = select('#settings.modal nav > ul').getElementsByTagName('li');
for (i = 0; i < settingsItems.length; i++) {
	settingsItems[i].i = i;
	settingsItems[i].onclick = function () {
		var theNumber = this.i;
		[].map.call(selectAll('#settings.modal nav > ul li'), function(obj) {
			obj.classList.remove('focused');
		});

		select('#settings.modal nav > ul li:nth-of-type(' + (theNumber+1) + ')').classList.add('focused');

		[].map.call(selectAll('#settings.modal .page'), function(obj) {
			obj.style.display = 'none';
		});

		selectAll('#settings.modal .page:nth-of-type(' + (theNumber+1) + ')')[0].style.display = 'block';
	};
}
