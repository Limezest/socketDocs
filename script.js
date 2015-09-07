var socket = io.connect(location.origin);

$('[contenteditable]').on('focus', function() {
var $this = $(this);
	$this.data('before', $this.html());
	return $this;
}).on('blur keyup paste', function() {
	var $this = $(this);
	if ($this.data('before') !== $this.html()) {
		$this.data('before', $this.html());
		$this.trigger('change');
	}
	return $this;
})

$('#tbody>tr>td').change(function(obj) {
	handler({
		id: obj.currentTarget.id,
		value: obj.currentTarget.innerText
	});
});

function handler(obj) {
	socket.emit('cell:changeEmit', obj);
}

socket.on('cell:changeBroadcast', function(message) {
	$('#'+message.id).html(message.value);
});

var alignment = 'center';
$('#left').click(function() {
	align('left');
});
$('#center').click(function() {
	align('center');
});
$('#right').click(function() {
	align('right');
});
$('#justify').click(function() {
	align('justify');
});
$('#font-less').click(function() {
	font('less');
});
$('#font-more').click(function() {
	font('more');
});

function align(param) {
	$('#tbody>tr>td').toggleClass('text-center', false);
	$('#tbody>tr>td').toggleClass('text-'+alignment, false);
	socket.emit('cell:alignmentEmit', {past: alignment, next: param});
	alignment = param;
	$('#tbody>tr>td').addClass('text-'+alignment);
}

function font(param) {
	var fontSize = parseInt($('#tbody>tr>td').css('font-size'));
	var value;
	param == 'more' ? value = 1 : value = -1;
	fontSize = fontSize + value + "px";
	$('#tbody>tr>td').css({'font-size': fontSize});
	socket.emit('cell:fontEmit', value);
}


socket.on('cell:alignmentBroadcast', function(message) {
	$('#tbody>tr>td').toggleClass('text-'+message.past, false);
	$('#tbody>tr>td').addClass('text-'+message.next);
});

socket.on('cell:fontBroadcast', function(message) {
	var fontSize = parseInt($('#tbody>tr>td').css('font-size'));
	fontSize = fontSize + message + "px";
	$('#tbody>tr>td').css({'font-size': fontSize});
});

socket.on('user:changeBroadcast', function(users) {
	console.log(users);
	//$('#user-list').html(users.sort().join('  <span style="color: darkGray"><i>|</i></span>  '));

	$('#user-list').empty();
	for (var i = 0; i < users.length; i++) {
		var user = users[i];
		$('#user-list').append('<li><img src="'+ user.avatar +'" height="42" width="42"></img>&nbsp;'+ user.name +'</li>');
	}
});

			/* //  Cell selection, but disables the contenteditable tag
				var table = $("#table");

				var isMouseDown = false;
				var startRowIndex = null;
				var startCellIndex = null;

				function selectTo(cell) {

				    var row = cell.parent();
				    var cellIndex = cell.index();
				    var rowIndex = row.index();

				    var rowStart, rowEnd, cellStart, cellEnd;

				    if (rowIndex < startRowIndex) {
				        rowStart = rowIndex;
				        rowEnd = startRowIndex;
				    } else {
				        rowStart = startRowIndex;
				        rowEnd = rowIndex;
				    }

				    if (cellIndex < startCellIndex) {
				        cellStart = cellIndex;
				        cellEnd = startCellIndex;
				    } else {
				        cellStart = startCellIndex;
				        cellEnd = cellIndex;
				    }

				    for (var i = rowStart; i <= rowEnd; i++) {
				        var rowCells = table.find("tr").eq(i).find("td");
				        for (var j = cellStart; j <= cellEnd; j++) {
				            rowCells.eq(j).addClass("selected");
				        }
				    }
				}

				table.find("td").mousedown(function (e) {
				    isMouseDown = true;
				    var cell = $(this);

				    table.find(".selected").removeClass("selected"); // deselect everything

				    if (e.shiftKey) {
				        selectTo(cell);
				    } else {
				        cell.addClass("selected");
				        startCellIndex = cell.index();
				        startRowIndex = cell.parent().index();
				    }

				    return false; // prevent text selection
				})
				.mouseover(function () {
				    if (!isMouseDown) return;
				    selectTo($(this));
				})
				.bind("selectstart", function () {
				    return false;
				});

				$(document).mouseup(function () {
				    isMouseDown = false;
				});
			*/


// Loading cells values from server on page loading
function serverToLocal(array) {
	for (var i = 0; i < array.length; i++) {
		var arr = array[i];
		$('#'+arr.id).text(arr.value);
	}
}
socket.on('cell:loadEmit', function(cellValues) {
	serverToLocal(cellValues);
});
