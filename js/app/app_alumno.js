var app = angular.module('appLaescuela',[]);
//var url_server = 'http://127.0.0.1:8080/';
var url_server = 'http://159.203.128.165:8085/';
var socket = io.connect(url_server);
$(document).ready(function (){
    $("#form").hide();
    $("#enviar").hide();

    var dialog = document.querySelector('dialog');
    var showModalButton = document.querySelector('.show-modal');
    if (! dialog.showModal) {
      dialogPolyfill.registerDialog(dialog);
    }
    showModalButton.addEventListener('click', function() {
      dialog.showModal();
    });
    dialog.querySelector('.close').addEventListener('click', function() {
      dialog.close();
    });

    $('select').material_select();
    
});

//Controlador para el inicio del sistema de la escuela
app.controller('alumnoCtrl', ['$scope', '$http', function($scope, $http) {
    if (localStorage.getItem("usuario")==null) {
        window.location.href = "../../index.html";   
    }
    //var url_server = 'http://192.168.0.100:8080/';
    //Logearse en el sistema
    var usuario = localStorage.getItem("usuario")///nuevo|
    $scope.usuario = JSON.parse(usuario);//NUEVO
    
    $("#hideForm").click(function(){
        //alert("1");
        $("#form").hide();
        $("#main").show(); 
    });
    $("#showForm").click(function(){
        //alert("2.1");
        $("#form").show();
        $("#main").hide(); 
        $("#content").val("");
    });

    obtenerAllNotif();
    obtenerAllNotifMA();

    $scope.maestromaterias = [];
    $scope.materiasM = [];
    $scope.alumnos = [];
    $scope.alumnosgrupo = [];
    //alert("carrera "+$scope.usuario.ESCIDCA)
    //primero hay que obtener las materias de este maestro(ids)
    if (unit == undefined) {
        obtenerMaterias(function(materias){
            $scope.maestromaterias = materias;
            for (i in $scope.maestromaterias) {
                    // Buscamos al grupo
                obtenerGrupo($scope.maestromaterias[i].ESCIDEG, function(materia){
                    materia.forEach(function(i, pos){
                        obtenerMat(i.ESCIDEM, function(mat){ 
                            $scope.materiasM.push(mat);
                        })
                    });
                });
                   
            }
        });
    }
    //obtener todos los grupos, independientemente de la escuela, todos los grupos
    //obtenerGrupos();

    function obtenerMaterias(callback){
        $http.get(url_server+"alumnomateria/obtenerMaterias/"+$scope.usuario._id).success(function(response) {
            if(response.status) { // Si nos devuelve un OK la API...
                callback(response.data);
            }
        })
    }

    function obtenerGrupo(idg, callback){
        $http.get(url_server+"grupomateria/buscarxgrupoRelGruMat/"+idg).success(function(res) {
            //alert("i "+$scope.maestromaterias[i].ESCIDEM)
            callback(res.data);
            /*$http.get(url_server+"materia/buscarMateria/"+res.data.ESCIDEM).success(function(r) {
                if(r.status){
                    $scope.materiasM.push(r.data);
                }
            });*/
        });
    }

    function obtenerMat(idm, callback){
        $http.get(url_server+"materia/buscarMateria/"+idm).success(function(r) {
            if(r.status){
                callback(r.data);
                //$scope.materiasM.push(r.data);
            }
        });
    }

    function obtenerGrupos(){
        //alert("obtenerGrupos")
        $scope.allgrupos = [];
        $http.get(url_server+"grupos/todosGrupos").success(function(response) {
            if(response.status){
                $scope.allgrupos = response.data;
            }
        });
    }

    //funcion que obtiene el parametro que esta en la url...si existe
    function getUrlParameter(sParam) {
        //alert("sParam "+sParam)
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };

    //$scope.oneMateria = "";
    $scope.oneMateria = [];
    $scope.oneGrupo = "";
    var search = getUrlParameter('search');//capturando id de la materia en la url
    var idMateria = "";
    $scope.idGrupo = "";
    
    if (search != undefined) {
        var arreglo = search.split("/");
        idMateria = arreglo[0];
        $scope.idGrupo = arreglo[1];
        $http.get(url_server+"materia/buscarMateria/"+idMateria).success(function(response) {
            if(response.status){
                //$scope.oneMateria = response.data.ESCNOMM;
                $scope.oneMateria = response.data;
                $http.get(url_server+"grupos/buscarGrupo/"+$scope.idGrupo).success(function(resp) {
                    if (resp.status) {
                        $scope.oneGrupo = resp.data.ESCNOMG;
                    }
                });
            }
        });
        obtenerUnidadesM();
        obtenerAlumnosGpo();
    }

    function obtenerUnidadesM(){
        $http.get(url_server+"unidades/listarUnidades/"+idMateria).success(function(response) {
            if(response.status) { // Si nos devuelve un true significa que todo esta bien
                $scope.unidadesM = response.data;
            }
        });
    }

    //funcion que lista todas las escuelas
    function listarAlumnos(){
        var idE = $scope.usuario.ESCIDEM;
        //alert("idE "+idE);
        if(idE != undefined || idE != ""){
            $http.get(url_server+"alumno/listarAlumnos/"+idE).success(function(response) {
                if(response.status) { // Si nos devuelve un true significa que todo esta bien
                    $scope.alumnos = response.data;
                }
            })
        }
    }

    //obtener id de los alumnos por grupo
    function obtenerAlumnosGpo(){
        listarAlumnos();//lista todos los alumnos que existen en la escuela
        $http.get(url_server+"alumnomateria/buscarxmateriaRelAluMat/"+$scope.idGrupo).success(function(response) {
            if(response.status) { // Si nos devuelve un true significa que todo esta bien
                $scope.alumnosgrupo = response.data;
            }
        })
    }

    var unit = getUrlParameter('unit');//capturando id de la unidad en la url
    var idUnidad = "";
    $scope.oneUnidad = [];
    if (unit != undefined) {
        var arreglo = unit.split("/");
        idUnidad = arreglo[0];
        $scope.idGrupo = arreglo[1];
        $http.get(url_server+"unidades/buscarUnidad/"+idUnidad).success(function(response) {
            if(response.status){
                $scope.oneUnidad = response.data;
                $http.get(url_server+"materia/buscarMateria/"+$scope.oneUnidad.ESCIDCM).success(function(response) {
                    //$scope.oneMateria = response.data.ESCNOMM;
                    $scope.oneMateria = response.data;
                     $http.get(url_server+"grupos/buscarGrupo/"+$scope.idGrupo).success(function(resp) {
                        if (resp.status) {
                            $scope.oneGrupo = resp.data.ESCNOMG;
                        }
                    });
                });
            }
        });
        obtenerTareasU(function(tareas){
            $scope.tareas = [];
            if(tareas.length > 0){
                tareas.forEach(function(i, pos){
                    obtenerTarea(i._id, i.ESCESTT, i.ESCIDET, function(tar){
                        //tar.idRel = i._id;
                        $scope.tareas.push(tar);
                        //alert(JSON.stringify($scope.tareas))
                    });
                })
            }
        });
        //obtenerAlumnosGpo();
        //obtenerAllRel();
    }

    $scope.nuevaTarea = function(){
        /*alert("fecha "+$("#fecha").val());
        //alert("contenido "+$scope.tareaN.ESCLIMT);
        return;*/
        if($scope.tareaN.ESCDEPT == undefined){
            $scope.tareaN.ESCDEPT = "";
        }
        $scope.tareaN.ESCLIMT = $("#fecha").val();
        $scope.tareaN.ESCCONT = $scope.tareas.length+1;
        $scope.tareaN.ESCFECT = obtenerFecha();
        $scope.tareaN.ESCIDTU = idUnidad;
        $http.post(url_server+"tarea/nuevaTarea", $scope.tareaN).success(function(response) {
            if(response.status){
                $scope.tareaN = {};
                obtenerTareasU();
                Materialize.toast("Tarea creada exitosamente", 3500, 'rounded');
                $("#form").hide();
                $("#main").show();
            }
        });
    }
    $scope.tmpTarea = [];
    $scope.showEnviar = function(tarea){

        if(tarea.ESCDEPT){
            obtenerTarea(tarea.idRel, tarea.ESCESTT, tarea.ESCDEPT, function(tar){
                $scope.dependenciatmp = tar;
                obtenerAllRelDep();
                $("#enviar").show();
                $("#main").hide();
                $scope.tmpTarea = tarea;
            });
        }else{
            $scope.dependenciatmp = null;
            $("#enviar").show();
            $("#main").hide();
            $scope.tmpTarea = tarea;
        }
        obtenerAllRel();
        //alert("aaa "+tarea._id)
    }

    $scope.hideEnviar = function(){
        $scope.dependenciatmp = null;
        $("#enviar").hide();
        $("#main").show();
        $scope.tmpTarea = [];
    }

    function obtenerTareasU(callback){
        //$scope.tareas = [];
        $http.get(url_server+"tareaalumno/listarRelTarAlu/"+$scope.usuario._id+"/"+idUnidad).success(function(response) {
            if(response.status){
                //alert("ok "+response.data.length);
                callback(response.data);
                //$scope.tareas = response.data;

            }else{
                callback(null);
            }
        });
    }

    obtenerAllRel()

    function obtenerAllRel(){
        //alert("obtenerAllRel")
        //alert("obtenerAllRel "+$scope.usuario._id);//id del alumno
        $scope.allRel = [];
        $http.get(url_server+"tareaalumno/listarAllRel").success(function(response) {
            if(response.status){
                //alert("ok "+response.data.length);
                //alert(" aaa --> "+response.data[0].ESCESTT);
                $scope.allRel = response.data;
                for (var i = 0; i < response.data.length ; i++) {
                    if($scope.tmpTarea._id == response.data[i].ESCIDET && response.data[i].ESCIDEA == $scope.usuario._id){
                        $scope.tmpDataT = response.data[i];
                    }
                }
            }
        });
    }

    function obtenerAllRelDep(){
        //alert("obtenerAllRel "+$scope.usuario._id);//id del alumno
        //response.data = [];
        $http.get(url_server+"tareaalumno/listarAllRel").success(function(response) {
            if(response.status){
                //alert("ok "+response.data.length);
                //alert(" aaa --> "+response.data[0].ESCESTT);
                //response.data = response.data;
                for (var i = 0; i < response.data.length ; i++) {
                    if($scope.dependenciatmp._id == response.data[i].ESCIDET && response.data[i].ESCIDEA == $scope.usuario._id){
                        $scope.tmpDataTDep = response.data[i];
                    }
                }
            }
        });
    }

    function obtenerTarea(idr, status, idt, callback){
        //$scope.tareas = [];
        $http.get(url_server+"tarea/buscarTarea/"+idt).success(function(response) {
            if(response.status){
                //alert("ok "+response.data.length);
                response.data.status = status;
                response.data.idRel = idr;
                callback(response.data);
                //$scope.tareas = response.data;

            }else{
                callback(null);
            }
        }).error(function(e){alert(JSON.stringify(e))});
    }

    /*$scope.enviarTarea = function(){
        //ag.ESCIDEA
        $http.get(url_server+'tareaalumno/actualizarEstTarea', { params : {id: $scope.tmpTarea.idRel, estatus: "E", fecha: $scope.tmpTarea.ESCLIMT }}).success(function(respuesta){
            if(respuesta.status){
                $http.get(url_server+'tarea/actualizarEstTarea', { params : {id: $scope.tmpTarea._id, estatus: "R" }}).success(function(resp){
                    if(resp.status){
                        obtenerTareasU(function(tareas){
                            $scope.tareas = [];
                            if(tareas.length > 0){
                                tareas.forEach(function(i, pos){
                                    obtenerTarea(i._id, i.ESCESTT, i.ESCIDET, function(tar){
                                        //tar.idRel = i._id;
                                        $scope.tareas.push(tar);
                                    });
                                })
                            }
                        });
                        Materialize.toast("Tarea enviada exitosamente", 3500, 'rounded');
                        $("#enviar").hide();
                        $("#main").show();
                        $scope.tmpTarea = [];   
                    }
                });  
            }
        });
    }*/

    function obtenerAllNotif(){
        $scope.notifications = [];
        //alert("obtenerAllRel "+$scope.usuario._id);//id del alumno
        //response.data = [];
        $http.get(url_server+"notificaciones/listarNotif").success(function(response) {
            if(response.status){
                //alert("len notif "+response.data.length);
                $scope.notifications = response.data;
            }
        });
    }

    function obtenerAllNotifMA(){
        //alert("len notif "+$scope.notifications.length);
        $scope.notificationsMA = [];
        //alert("obtenerAllRel "+$scope.usuario._id);//id del alumno
        //response.data = [];
        $http.get(url_server+"notificaciones/listarNotifMA").success(function(response) {
            if(response.status){
                //alert("len notifMA "+response.data.length);
                for (var i = 0; i < response.data.length ; i++) {
                    //if($scope.usuario._id == response.data[i].ESCIDAN){
                    if($scope.usuario._id == response.data[i].ESCIDAN && (response.data[i].ESCTIPN == 'E' || response.data[i].ESCTIPN == 'C')){
                        $scope.notificationsMA.push(response.data[i]);
                    }
                }
                //alert("len notifMA "+$scope.notificationsMA.length);
                //$scope.notificationsMA = response.data;
            }
        });
    }

    $scope.enviarTarea = function(){
        //ag.ESCIDEA
        $("#message").empty();
        var urltarea = $("#location").val();
        if(urltarea == ""){
            $("#message").html("<div class='alert alert-danger'>Agrega la URL de la tarea</div>");
            //$("#message").html("Agrega la URL de la tarea");
            return;
        }
        $http.get(url_server+'tareaalumno/actualizarEstTarea', { params : {id: $scope.tmpTarea.idRel, estatus: "E", fecha: $scope.tmpTarea.ESCLIMT, url: urltarea}}).success(function(respuesta){
            if(respuesta.status){
                $http.get(url_server+'tarea/actualizarEstTarea', { params : {id: $scope.tmpTarea._id, estatus: "R" }}).success(function(resp){
                    if(resp.status){
                        obtenerTareasU(function(tareas){
                            $scope.tareas = [];
                            if(tareas.length > 0){
                                tareas.forEach(function(i, pos){
                                    obtenerTarea(i._id, i.ESCESTT, i.ESCIDET, function(tar){
                                        //tar.idRel = i._id;
                                        $scope.tareas.push(tar);
                                    });
                                })
                            }
                        });

                        var notif = {
                            ESCTITN: "Tarea Realizada!",//Titulo de la notificacion
                            ESCCONN: "Se realizó la tarea "+$scope.tmpTarea.ESCCONT+" ("+$scope.tmpTarea.ESCBODT+")",//Contenido de la tarea
                            ESCFECN: obtenerFecha(),//fecha de la notificacion
                            ESCMATN: $scope.oneMateria._id, //id de la materia que es
                            ESCIDUN: $scope.oneUnidad._id//Id de la unidad
                        };

                        $http.post(url_server+"notificaciones/Notificacion", notif).success(function(resp) {
                            if(resp.status){
                                var relacionMA = {
                                    ESCIDNO: resp.data._id,//id de la notificacion
                                    ESCIDMN: $scope.tmpTarea.ESCIDMA,//Id de la notificacion
                                    ESCIDAN: $scope.usuario._id,
                                    ESCTIPN: "R"//Realizado
                                };
                                $http.post(url_server+"notificaciones/notifMaestroAlumno", relacionMA).success(function(r) {
                                    if(r.status){
                                        console.log("agregado");
                                        socket.emit("notifAM", "Tarea Realizada", $scope.tmpTarea.ESCIDMA);
                                        Materialize.toast("Tarea enviada exitosamente", 3500, 'rounded');
                                        $("#enviar").hide();
                                        $("#main").show();
                                        $scope.tmpTarea = [];   
                                    }
                                }); 
                            }
                        });

                        //socket.emit("notifAM", "Tarea Enviada", $scope.tmpTarea.ESCIDMA);

                        /*Materialize.toast("Tarea enviada exitosamente", 3500, 'rounded');
                        $("#enviar").hide();
                        $("#main").show();
                        $scope.tmpTarea = [];   */
                    }
                });  
            }
        });
    }

    $scope.verTarea = function(unidad, id, estatus){
        if(estatus == 0){//entonces hay que actualizarlo
            $http.get(url_server+'notificaciones/actualizarEstatus', { params : {id: id, estatus: 1 }}).success(function(response){
                if (response.status) {
                    window.location.href = "agreements.html?unit="+unidad+"/";
                }
            });
        }else{
            window.location.href = "agreements.html?unit="+unidad+"/";
        }
    }
    
    //$scope.miPromedio = 0;

    $scope.promedio = function(){
        //alert("tareas "+$scope.tareas.length);
        $scope.miPromedio = 0;
        var contador = 0;
        if($scope.tareas.length > 0){
            for (var i = 0; i < $scope.tareas.length ; i++) {
                for (var j =  0; j < $scope.allRel.length ; j++) {
                    if ($scope.allRel[j].ESCIDET == $scope.tareas[i]._id && $scope.allRel[j].ESCIDEA == $scope.usuario._id && $scope.allRel[j].ESCCALT > -1) {
                        contador++;
                        $scope.miPromedio += $scope.allRel[j].ESCCALT;
                    }
                }
            }
            $scope.miPromedio = $scope.miPromedio / contador;
        }
    }

    function obtenerFecha(){
        // Obtenemos la fecha de hoy con el formato dd/mm/yyyy
        var today = new Date()
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10){
            dd='0'+dd
        } 
        if(mm<10){
            mm='0'+mm
        } 
        var today = dd+'/'+mm+'/'+yyyy;
        //alert(today);
        return today;
    }

    socket.on("maestroalumno", function (msg,id) {
        //alert("AAAA "+id+" scope "+$scope.usuario._id);
        //sonidoNotif();
        if($scope.usuario._id == id){
            sonidoNotif();
            Materialize.toast("Tiene una nueva tarea", 3500);
            /*<button class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon" id="notif">
                <i class="fa fa-bell-o"></i>
            </button>*/
            $('#notificacion').css('background-color', '#FF0000');
            //$("#notificacion").empty();
            //$("#notificaion").html("<button class='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon red' id='notif'>"+
            //    +"<i class='fa fa-bell-o'></i></button>");
            $("#allNotif").empty();
            //$("#notif").html("Nuevo+");
            $("#allNotif").html("<li class='mdl-menu__item'><a class='text-center' href='notificaciones.html'><strong>Hay una nueva notificación</strong></a></li>");
        }
    });

    //$scope.sonidoNotif = function(){
    function sonidoNotif(){
        //alert("sonidoNotif");
        //var beep = new Audio("./app/sounds/notificacion.ogg");
        var beep = new Audio("../../js/sound/notificacion.mp3");
        beep.play();
    }

    //Cerrar sesion
    $scope.logout = function(){
        localStorage.removeItem("usuario")
        window.location.href = '../../index.html'
    }

}]);
