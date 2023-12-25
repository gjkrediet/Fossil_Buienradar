return {
    node_name: '',
    manifest: {
        timers: ['inactivity_timer']
    },
    persist: {},
    config: {},
	full_refresh_needed: true,
	inactivity_timeout: 15*1000,
    handler: function (event, response) {
        this.wrap_event(event)
        this.wrap_response(response)
        this.state_machine.handle_event(event, response)
    },
    log: function (object) {
		object.logentry_from = this.node_name;
        req_data(this.node_name, '"type": "log", "data":' + JSON.stringify(object), 9, true)
    },
    is_connected: function(){
        return get_common().app_status == 'connected'
    },
	buienradar_retrieve: function() {
        if(this.is_connected()){
			req_data(this.node_name, '"commuteApp._.config.commute_info":{"dest":"RetrieveBuienradar","action":"start"}', 999999, true);
		}
	},
    draw_info: function (response) {		
        response.draw = {
            node_name: this.node_name,
//            background: get_common().U('INVERTED')?'BGIbradar.raw':'BGbradar.raw',
            update_type: this.full_refresh_needed ? 'gc4' : 'du4',
        };
		var layout_info = {
			json_file: 'buienradar_layout',
		}
		
		if (this.config.weather_rain !== undefined) {
			var intensity;
			var resolution = this.config.weather_rain.resolution; //number of datapoints
			var span = this.config.weather_rain.span; //total minutes of the series
			var step_x = Math.floor(168/resolution); //number of pixels per datapoint			
			var now_minutes = 60 * get_common().hour + get_common().minute;
//			now_minutes -= - get_common().minute%5;
			var start_minutes = this.config.weather_rain.start;
			var diff_minutes; //calculated number of minutes that start_minutes is behind on now_minutes
			var raindata=this.config.weather_rain.raindata;
			//check the difference between start of the series and current time. First check times around midnight
			if (now_minutes > 1425 && start_minutes < 15) {
				diff_minutes = 1440 - now_minutes + start_minutes;
			}
			else if (start_minutes > 1425 && now_minutes < 15) {
				diff_minutes = -1440 + start_minutes - now_minutes;
			}
			else {
				diff_minutes = now_minutes - start_minutes;
			}
			if (raindata.length != 72 || Math.abs(diff_minutes) > 15) {
				start_minutes = -1;
			} else {
				var dataindex = 0;
				var barnum = 0;
				var barpos = 37;
				for (dataindex;dataindex<resolution/4;dataindex++) {
					intensity = raindata.substring(dataindex*3,dataindex*3+3); //single datapoint
					intensity = 5*Math.sqrt(intensity); //to make the graph more intuitive
					intensity = Math.round(intensity);
					intensity += 1;
					layout_info['h_' + barnum] = intensity;
					layout_info['y_' + barnum] = 83 - intensity;
					layout_info['x_' + barnum] = barpos;
					layout_info['w_' + barnum] = step_x - (intensity > 1 ? 1 : 3);
					++ barnum;
					barpos += step_x;
				}
				for (dataindex;dataindex<resolution-1;dataindex += 2) {
					intensity = Math.max(raindata.substring(dataindex*3,dataindex*3+3), raindata.substring(dataindex*3+3,dataindex*3+6)); //combine 2 datapoints
					intensity = 5*Math.sqrt(intensity); //to make the graph more intuitive
					intensity = Math.round(intensity);
					intensity += 1;
					layout_info['h_' + barnum] = intensity;
					layout_info['y_' + barnum] = 83 - intensity;
					layout_info['x_' + barnum] = barpos;
					layout_info['w_' + barnum] = step_x * 2 - (intensity > 1 ? 1 : 3);
					++barnum;
					barpos += step_x * 2;
				}
			}
			if (start_minutes < 0) {
				layout_info['marker1_xpos'] = 70;
				layout_info['marker2_xpos'] = 100;
				layout_info['marker_ypos'] = 56;
				layout_info['marker1'] = '? ?'
				layout_info['marker2'] = '? ?'
			} else {
				var rainhour=Math.floor(this.config.weather_rain.start/60);
				var rainminute=this.config.weather_rain.start%60;
				layout_info['marker_ypos'] = 77;

				layout_info['marker0_xpos'] = 17 + diff_minutes*step_x*resolution/span;
				layout_info['marker0'] = '|\nnu';

				var hour;
				rainhour=(++rainhour)%24;
				// prepend leading zero if needed
				hour ='0' + rainhour;
				hour = hour.substring(hour.length-2,hour.length);
				layout_info['marker1_xpos'] = 17 + (60-rainminute)*step_x*resolution/span;
				//Do not show first hour marker if close to the 'now-marker'
				if ((60-rainminute) > diff_minutes + 17) layout_info['marker1'] = '|\n' + hour + '00';
				rainhour=(++rainhour)%24;
				hour ='0' + rainhour;
				hour = hour.substring(hour.length-2,hour.length);
				layout_info['marker2_xpos'] =  17 + (120-rainminute)*step_x*resolution/span;
				layout_info['marker2'] = '|\n' + hour + '00';
				layout_info['plaats'] = this.config.weather_rain.city;
			}
		}
		layout_info['line_1mm'] = '-   -   -   -   -' + ' 1mm ' + '-   -   -   -   -';
		layout_info['line_10mm'] =  '-   -   -   -   -' + ' 10mm ' + '-   -   -   -   -';
		layout_info['button_middle'] = 'icHome';
		layout_info['button_middle_x'] = get_common().U('WATCH_MODE')=='LEFTIE' ? 10 : 210;
		layout_info['invert'] = get_common().U('INVERTED');
		response.draw[this.node_name] = {
			'layout_function': 'layout_parser_json',
			'layout_info': layout_info,
		}
		this.full_refresh_needed=false;
		stop_timer(this.node_name, 'inactivity_timer')
		start_timer(this.node_name, 'inactivity_timer', this.inactivity_timeout)
		response.emulate_double_tap();
	},
    wrap_state_machine: function(state_machine) {
        state_machine.set_current_state = state_machine.d
        state_machine.handle_event = state_machine._
        state_machine.get_current_state = function(){
            return state_machine.n
        }
        return state_machine
    },
    wrap_event: function (system_state_update_event) {
        if (system_state_update_event.type === 'system_state_update') {
            system_state_update_event.concerns_this_app = system_state_update_event.de
            system_state_update_event.old_state = system_state_update_event.ze
            system_state_update_event.new_state = system_state_update_event.le
        }
        return system_state_update_event
    },
    wrap_response: function (response) {
        response.move_hands = function (degrees_hour, degrees_minute, relative) {
            response.move = {
                h: degrees_hour,
                m: degrees_minute,
                is_relative: relative
            }
        }
        response.go_home = function (kill_app) {
            response.action = {
                type: 'go_home',
                Se: kill_app
            }
        }
        response.send_user_class_event = function (event_type) {
            response.send_generic_event({
                type: event_type,
                class: 'user'
            })
        }
        response.emulate_double_tap = function(){
            this.send_user_class_event('double_tap')
        }
        response.send_generic_event = function (event_object) {
            if (response.i == undefined) response.i = []
            response.i.push(event_object)
        }
        return response
    },
    handle_global_event: function (self, state_machine, event, response) {
        if (event.type === 'system_state_update' && event.concerns_this_app === true) {
            self.state_machine.set_current_state('weather_info');
        } else if(event.type === 'node_config_update' && event.node_name === self.node_name) {
			self.draw_info(response)
        } else if (event.type === 'middle_hold') {
            response.go_home(true)
        }
    },
    handle_state_specific_event: function (state, state_phase) {
        switch (state) {
            case 'weather_info': {
                if (state_phase == 'entry') {
                    return function (self, response) {
                        response.move_hands(270,270,false)
						self.draw_info(response)
						self.buienradar_retrieve()
                  }
                }
                if (state_phase == 'during') {
                    return function (self, state_machine, event, response) {
						if (event.type === 'middle_short_press_release' || event.type == 'flick_away' 
							|| (event.type == 'timer_expired' && is_this_timer_expired(event, self.node_name, 'inactivity_timer'))) {
							response.go_home(true)
						}
					}
                }
                if (state_phase == 'exit') {
					return function (arg, arg2) {
						stop_timer(self.node_name, 'inactivity_timer')
//                    return function (self, response) {
					};
                }
                break;
            }
        }
        return
    },
    init: function () {
        this.state_machine = new state_machine(
            this,
            this.handle_global_event,
            this.handle_state_specific_event,
            undefined,
            'background'
        );
        this.wrap_state_machine(this.state_machine);
    },
}
