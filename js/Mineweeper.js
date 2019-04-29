function Mine(x, y){
	this.x = x
	this.y = y
}

Mine.prototype.toString = function(){
  return '('+this.x+', '+this.y+')';  
}


function randInt(m, n){
	return parseInt(Math.random()*(n-m)+m,10)
}

var vm = new Vue({
	el:'#App',
	data:{
		height : [8, 16, 16],
		width : [8, 16, 30],
		default_mine_num : [10, 40, 99],
		isEnd:false,

		graph : '',
		map : [],
		mine_array : [],
		flag:[],
		flag_size:0,
		empty_size:0,
		
		rank:0,

		mode : 0,
		mode_name: ["排雷模式","标记模式"],
		
		color:['#FFD2D2', 'white', '#7FFFAA'],
		lable_color:0,
		default_color:1,
		empty_color:2,
	},
	methods:{
		get_width:function(){
			return this.width[eval(this.rank)]
		},
		get_height:function(){
			return this.height[eval(this.rank)]
		},
		get_mine_num:function(){
			return this.default_mine_num[eval(this.rank)]
		},
		generate_mine:function(){
			this.mine_array = []
			check_array = {}
			for(var i = 0; i < this.get_mine_num(); i++){
				var mine = new Mine(randInt(0,this.get_height()),randInt(0,this.get_width()))
				while(check_array[mine]){
					mine = new Mine(randInt(0,this.get_height()),randInt(0,this.get_width()))
				}
				check_array[mine] = true
				this.mine_array.push(mine)
			}
		},
		cal_num_of_mine_nearby:function(){
			//init
			this.map = []
			for(var i = 0; i < this.get_height(); i++){
				var row = []
				for(var j = 0; j < this.get_width(); j++){
					row.push(0)
				}
				this.map.push(row)
			}
			//cal
			for(var i = 0; i <this.get_mine_num(); i ++){
				var x = this.mine_array[i].x
				var y = this.mine_array[i].y
				for(var k = Math.max(0, x-1); k < Math.min(this.get_height(), x+2); k++){
					for(var j= Math.max(0, y-1); j < Math.min(this.get_width(), y+2); j++){
						this.map[k][j] ++
					}
				}
				this.map[x][y] = -111
			}
		},
		generate_table:function(){
			this.graph = "<table>"
			for(var i = 0; i < this.get_height(); i++){
				this.graph += "<tr>"
					for(var j = 0; j < this.get_width(); j++){
						this.graph += "<td id=" + i + '_' + j + " style='background:" + this.color[1] + ";width:30px;height:30px'>" + "" + "</td>" //this.map[i][j]
					}
				this.graph += "</tr>"
			}
			this.graph += "</table>"
		},
		start:function(){
			this.flag = []
			for(var i = 0;i < this.get_height(); i++){
				var row = []
				for(var j =0; j<this.get_width(); j++){
					row.push(this.default_color)
				}
				this.flag.push(row)
			}
			this.isEnd = false
			this.flag_size = 0
			this.empty_size=0
			//1.generate mine
			this.generate_mine()
			//2.calculate the number of the mine nearby
			this.cal_num_of_mine_nearby()
			//3.generate the table of the game
			this.generate_table()
		},
		empty:function(x, y, des_color){
			old_str = "<td id=" + x + '_' + y + " style='background:" + this.color[this.flag[x][y]] + ";width:30px;height:30px'></td>" 
			new_str = "<td id=" + x + '_' + y + " style='background:" + this.color[des_color] + ";width:30px;height:30px'>" 
			if(this.map[x][y] <= 0){
				new_str += "" 
			}
			else{
				new_str += this.map[x][y] 
			}
			new_str += "</td>"
			this.flag[x][y] = des_color
			this.graph = this.graph.replace(old_str,new_str)
		},
		show_all_table:function(){
			this.empty_size=this.flag_size=0
			for(var i = 0; i < this.get_height(); i ++){
				for(var j =0; j < this.get_width(); j++){
					this.empty(i, j , this.empty_color)
					this.empty_size++
				}
			}
			for(var i = 0; i < this.get_mine_num(); i++){
				this.empty(this.mine_array[i].x, this.mine_array[i].y, this.lable_color)
				this.flag_size++
				this.empty_size--
			}
		},
		is_mine:function(x, y){
			for(var i = 0; i < this.get_mine_num(); i++){
				if(this.mine_array[i].x == x && this.mine_array[i].y == y){
					if(this.empty_size == 0){
						this.start()
						this.is_mine(x, y)
					}
					else{
						this.show_all_table()
						this.isEnd = true
						alert("game over, you die!")
						return true
					}
				}
			}
			return false
		},
		mines_nearby:function(x, y){
			this.empty(x, y, this.empty_color)
			this.empty_size++
		},
		no_mine:function(x, y){
			var check_array = {}
			var queue = []
			var iter = 0
			var tmp = new Mine(x, y)
			queue.push(tmp)
			check_array[tmp] = true
			while(iter < queue.length){
				var now_point = queue[iter]
				iter ++
				var x = now_point.x
				var y = now_point.y
				
				if(this.flag[x][y] != this.empty_color){
					this.empty_size++
				}
				this.empty(x, y, this.empty_color)
				for(var k = Math.max(0, x-1); k < Math.min(this.get_height(), x+2); k++){
					for(var j= Math.max(0, y-1); j < Math.min(this.get_width(), y+2); j++){
						var tmp = new Mine(k ,j)
						if(!Boolean(check_array[tmp])){
							if(this.flag[k][j] == this.lable_color){
								continue
							}
							else if(this.map[k][j] == 0){
								queue.push(tmp)
								check_array[tmp] = true
							}
							else{
								if(this.flag[k][j] != this.empty_color){
									this.empty_size++
								}
								this.empty(k, j , this.empty_color)
							}
						}
					}
				}
			}
		},
		check_all_flag:function(){
			if(this.flag_size != this.get_mine_num()){
				return false
			}
			for(var i = 0; i < this.flag_size; i++){
				//console.log(this.mine_array[i].x, this.mine_array[i].y, this.flag[this.mine_array[i].x][this.mine_array[i].y])
				if(this.flag[this.mine_array[i].x][this.mine_array[i].y] != this.lable_color){
					return false
				}
			}
			return true
		},
		change_color:function(x, y, des_color){
			old_str = "<td id=" + x + '_' + y + " style='background:" + this.color[this.flag[x][y]] 
			new_str = "<td id=" + x + '_' + y + " style='background:" + this.color[des_color] 
			this.flag[x][y] = des_color
			this.graph = this.graph.replace(old_str,new_str)
		},
		lable:function(x, y){
			//have labled,cancel lable
			if(this.flag[x][y] == this.lable_color){
				this.change_color(x, y, this.default_color)
				this.flag[x][y] = this.default_color
				this.flag_size--
			}
			else if(this.flag[x][y] == this.empty_color){
				return
			}
			else{
				this.change_color(x, y, this.lable_color)
				this.flag[x][y] = this.lable_color
				this.flag_size++
			}
			if(this.check_all_flag())
			{
				this.show_all_table()
				this.isEnd = true
				alert("you win the game")
			}
		},
		leftClick:function(event){
			//end
			if(this.isEnd == true){
				return 
			}
			//get element
			id  = event.target.id
			if(event.target.nodeName != 'TD'){
				return
			}
			var x = eval(id.split('_')[0])
			var y = eval(id.split('_')[1])

			//label mode
			if(this.mode == 1){
				this.lable(x, y)
				return 
			}
			//operate label cell
			if(this.flag[x][y] == this.lable_color){
				return
			}
			//operate empty cell
			if(this.flag[x][y] == this.empty_color){
				return 
			}

			//1.is mine
			if(this.is_mine(x, y))
				return 
			
			//2.there are mines nearby 
			if(this.map[x][y] > 0){
				this.mines_nearby(x, y)
			}
			//3.no mines nearby
			else{
				this.no_mine(x, y)
			}
			if(this.empty_size == this.get_width() * this.get_height() - this.get_mine_num()){
				this.show_all_table()
				this.isEnd = true
				alert("you win the game!")
			}
		},
		change_mode:function(){
			this.mode = 1 - this.mode
		}
	}
})
