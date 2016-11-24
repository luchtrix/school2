var app = angular.module('appLaescuela',[]);
//var url_server = 'http://127.0.0.1:8080/';
var url_server = 'http://159.203.128.165:8085/';
var socket = io.connect(url_server);
$(document).ready(function (){
    $("#form").hide();
    $("#enviar").hide();
    $("#calificacion").hide();

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
app.controller('maestroCtrl', ['$scope', '$http', function($scope, $http) {
    if (localStorage.getItem("usuario")==null) {
        window.location.href = "../../index.html";   
    }
    //var url_server = 'http://192.168.0.100:8080/';
    //Logearse en el sistema
    var usuario = localStorage.getItem("usuario")///nuevo|
    $scope.usuario = JSON.parse(usuario);//NUEVO

    /*else{
        window.location.href = "vistas/maestro/home.html";
        if($scope.usuario.ESCNOMM != ""){
            window.location.href = "vistas/maestro/home.html";
        }else if($scope.usuario.ESCNOMA != ""){
            window.location.href = "vistas/alumno/home.html";
        }
        //$scope.usuario = JSON.parse(localStorage.getItem("usuario"));//NUEVO
    }*/

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
    /*$("#send").click(function(){
        $("#enviar").show();
        $("#main").hide(); 
    });
    $("#hideSend").click(function(){
        $("#enviar").hide();
        $("#main").show(); 
    });*/

    //alert("carrera "+$scope.usuario.ESCIDCA)
    //primero hay que obtener las materias de este maestro(ids)
    obtenerMaterias();
    //obtener todos los grupos, independientemente de la escuela, todos los grupos
    obtenerGrupos();

    obtenerAllNotif();
    obtenerAllNotifMA();

    $scope.maestromaterias = [];
    $scope.materiasM = [];
    $scope.alumnos = [];
    $scope.alumnosgrupo = [];
    function obtenerMaterias(){
        //alert("obtenerMaterias");
        $http.get(url_server+"maestromateria/obtenerMaterias/"+$scope.usuario._id).success(function(response) {
            if(response.status) { // Si nos devuelve un OK la API...
                //alert("tam "+response.data.length+" ma "+response.data[0].ESCIDEM);
                $scope.maestromaterias = response.data;
                for (i in $scope.maestromaterias) {
                    //alert("i "+$scope.maestromaterias[i].ESCIDEM)
                    $http.get(url_server+"materia/buscarMateria/"+$scope.maestromaterias[i].ESCIDEM).success(function(r) {
                        if(r.status){
                            //alert("lo entonctro materia "+r.data.ESCNOMM);
                            //r.data.grupo = $scope.maestromaterias[i].ESCIDEG;
                            $scope.materiasM.push(r.data);
                        }
                    });
                }
            }
        })
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
    //$scope.tareasU = [];
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
        //obtenerPromedioForU();
    }
    
    function obtenerUnidadesM(){
        //$scope.tareasU = [];
        $http.get(url_server+"unidades/listarUnidades/"+idMateria).success(function(response) {
            if(response.status) { // Si nos devuelve un true significa que todo esta bien
                $scope.unidadesM = response.data;
                //alert("response "+response.data.length);
                /*for (i in $scope.unidadesM) {
                    //alert("response "+$scope.unidadesM[i]._id);
                    $http.get(url_server+"tarea/listarTareas/"+$scope.unidadesM[i]._id).success(function(resp) {
                        if(resp.status){
                            //alert("ok "+resp.data[0].ESCCONT);
                            $scope.tareasU.push(resp.data[0]);
                        }
                    });
                }*/
            }
        });
    }
    $scope.calif = 0;
    $scope.promedioUnit = function(id){
        //alert("id "+id);
        //alert("ok "+$scope.tareasU.length);
        $http.get(url_server+"tarea/listarTareas/"+id).success(function(response) {
            if(response.status){
                //alert("ok ")
                $http.get(url_server+"tareaalumno/listarAllRel").success(function(resp) {
                    if(resp.status){
                        //alert("ok 2")
                        for (var i = 0; i < resp.data.length ; i++) {
                            $("#"+id).empty();
                            if (resp.data[i].ESCIDET == response.data[0]._id) {
                                //alert("calificacion "+resp.data[i].ESCCALT);
                                if(resp.data[i].ESCCALT > -1){
                                    $scope.calif += resp.data[i].ESCCALT;
                                    $("#"+id).append("Promedio " + $scope.calif/response.data.length)
                                }
                            }
                        }
                    }
                });        
            }
        });
    }
    listarAlumnos();
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
        //alert("unit")
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
        obtenerTareasU();
        obtenerAlumnosGpo();
        obtenerAllRel();
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
        $scope.tareaN.ESCIDMA = $scope.usuario._id;
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
    $scope.tmpAlumno = [];
    $scope.tmpDataT = [];
    $scope.showEnviar = function(tarea){
        //alert("aaa "+tarea._id)
        $("#enviar").show();
        $("#main").hide();
        $scope.tmpTarea = tarea;
    }

    $scope.hideEnviar = function(){
        $("#enviar").hide();
        $("#main").show();
        $scope.tmpTarea = [];
    }

    $scope.showCalif = function(alumno){
        //alert("aaa "+alumno._id+" nom "+alumno.ESCNOMA);
        //alert("len "+$scope.relallta.length);
        //return;
        $("#calificacion").show();
        $("#enviar").hide();
        $scope.tmpAlumno = alumno;
        for (var i = 0; i < $scope.relallta.length ; i++) {
            if($scope.tmpTarea._id == $scope.relallta[i].ESCIDET && $scope.relallta[i].ESCIDEA == $scope.tmpAlumno._id){
                $scope.tmpDataT = $scope.relallta[i];
            }
        }
        //p ng-repeat="s in relallta" ng-if="tmpTarea._id == s.ESCIDET && a._id == s.ESCIDEA"
    }

    $scope.hideCalif = function(){
        $("#calificacion").hide();
        $("#enviar").show();
        $scope.tmpAlumno = [];
        $scope.tmpDataT = [];
    }

    function obtenerAllRel(){
        //alert("obtenerAllRel")
        $scope.relallta = [];
        $http.get(url_server+"tareaalumno/listarAllRel").success(function(response) {
            if(response.status){
                //alert("ok "+response.data.length);
                //alert(" aaa --> "+response.data[0].ESCESTT);
                $scope.relallta = response.data;
            }
        });
    }

    function obtenerTareasU(){
        //alert("obtenerGrupos")
        $scope.tareas = [];
        $http.get(url_server+"tarea/listarTareas/"+idUnidad).success(function(response) {
            if(response.status){
                //alert("ok "+response.data.length);
                $scope.tareas = response.data;
            }
        });
    }

    $scope.enviarTarea = function(){
        //ag.ESCIDEA
        //alert("aaaa");
        //alert("agop "+$scope.alumnosgrupo.length)
        //Crear la notificacion
        var notif = {
            ESCTITN: "Nueva Tarea",//Titulo de la notificacion
            ESCCONN: "Tiene una nueva Tarea (Tarea: "+$scope.tmpTarea.ESCCONT+") a realizar",//Contenido de la tarea
            ESCFECN: obtenerFecha(),//fecha de la notificacion
            ESCMATN: $scope.oneMateria._id, //id de la materia que es
            ESCIDUN: idUnidad//Id de la unidad
        };
        $http.post(url_server+"notificaciones/Notificacion", notif).success(function(response) {
            var idN = response.data._id;
            for(i in $scope.alumnosgrupo){
                socket.emit('notifMA', "Nueva Tarea", $scope.alumnosgrupo[i].ESCIDEA);//Es parecido al png, pero con baja calidad
                var relacion = {
                    ESCIDUN: idUnidad, //id de la carrera a la que pertenece
                    ESCIDEA: $scope.alumnosgrupo[i].ESCIDEA, // id del alumno
                    ESCIDET: $scope.tmpTarea._id, // id de la tarea
                    ESCFECE: obtenerFecha()//fecha cuando se envio la tarea...
                };
                $http.post(url_server+"tareaalumno/nuevaRelTarAlu", relacion).success(function(resp) {
                    if(resp.status){
                        console.log("agregado");
                    }
                });

                var relacionMA = {
                    ESCIDNO: idN,//id de la notificacion
                    ESCIDMN: $scope.usuario._id,//Id de la notificacion
                    ESCIDAN: $scope.alumnosgrupo[i].ESCIDEA,
                    ESCTIPN: "E"
                };

                $http.post(url_server+"notificaciones/notifMaestroAlumno", relacionMA).success(function(resp) {
                    if(resp.status){
                        console.log("agregado");
                        //socket.emit("Nueva Tarea",$scope.alumnosgrupo[i].ESCIDEA );
                    }
                });                

            }

            $http.get(url_server+'tarea/actualizarEstTarea', { params : {id: $scope.tmpTarea._id, estatus: "E" }}).success(function(respuesta){
                if(respuesta.status){
                    obtenerTareasU();
                    Materialize.toast("Tarea enviada exitosamente", 3500, 'rounded');
                    $("#enviar").hide();
                    $("#main").show();
                    $scope.tmpTarea = [];   
                }
            });

        });

    }
    
    $scope.calificarTarea = function(){
        //alert($scope.tmpDataT.ESCCALT);
        var calif = $("#calif").val();
        var obs = $("#obs").val();
        //alert("calif "+calif+" obs "+obs);
        $http.get(url_server+'tareaalumno/actualizarCalif', { params : {id: $scope.tmpDataT._id, calif: calif, obs: obs  }}).success(function(response){
            if(response.status){
                var notif = {
                    ESCTITN: "Tarea Calificada!",//Titulo de la notificacion
                    ESCCONN: "Se calificó a la tarea "+$scope.tmpTarea.ESCCONT+" ("+$scope.tmpTarea.ESCBODT+")",//Contenido de la tarea
                    ESCFECN: obtenerFecha(),//fecha de la notificacion
                    ESCMATN: $scope.oneMateria._id, //id de la materia que es
                    ESCIDUN: $scope.oneUnidad._id//Id de la unidad
                };

                $http.post(url_server+"notificaciones/Notificacion", notif).success(function(resp) {
                    if(resp.status){
                        var relacionMA = {
                            ESCIDNO: resp.data._id,//id de la notificacion
                            ESCIDMN: $scope.usuario._id,//Id de la notificacion
                            ESCIDAN: $scope.tmpDataT.ESCIDEA,
                            ESCTIPN: "C"//calificado
                        };
                        $http.post(url_server+"notificaciones/notifMaestroAlumno", relacionMA).success(function(r) {
                            if(r.status){
                                socket.emit('notifMA', "Tarea "+$scope.tmpTarea.ESCCONT+" calificada", $scope.tmpDataT.ESCIDEA);//Es parecido al png, pero con baja calidad
                                Materialize.toast("Tarea calificada...Recargando nuevos datos", 2500, 'rounded');              
                                var time_out = setTimeout(recargar, 3000)
                            }
                        });
                    }
                });
                //Materialize.toast("Tarea calificada", 3500, 'rounded');
            }
        });
    }

    function recargar(){
        location.reload();
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
        $scope.notificationsMA = [];
        //alert("obtenerAllRel "+$scope.usuario._id);//id del alumno
        //response.data = [];
        $http.get(url_server+"notificaciones/listarNotifMA").success(function(response) {
            if(response.status){
                //alert("len notifMA "+response.data.length);
                for (var i = 0; i < response.data.length ; i++) {
                    if($scope.usuario._id == response.data[i].ESCIDMN && response.data[i].ESCTIPN == 'R'){
                    //if($scope.usuario._id == response.data[i].ESCIDMN){
                        $scope.notificationsMA.push(response.data[i]);
                    }
                }
                //alert("len notifMA "+$scope.notificationsMA.length);
                //$scope.notificationsMA = response.data;
            }
        });
    }

    //$scope.verTarea = function(unidad, id, estatus){
    $scope.verTarea = function(id, estatus){
        if(estatus == 0){//entonces hay que actualizarlo
            $http.get(url_server+'notificaciones/actualizarEstatus', { params : {id: id, estatus: 1 }}).success(function(response){
                if (response.status) {
                    //window.location.href = "agreements.html?unit="+unidad+"/";
                    window.location.href = "home.html"
                }
            });
        }else{
            window.location.href = "home.html"
            //window.location.href = "agreements.html?unit="+unidad+"/";
        }
    }

    socket.on("alumnomaestro", function (msg,id) {
        //alert("AAAA "+id+" scope "+$scope.usuario._id);
        //sonidoNotif();
        if($scope.usuario._id == id){
            sonidoNotif();
            Materialize.toast("Tiene una nueva notifcación", 3500);
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

    $scope.logout = function(){
        localStorage.removeItem("usuario")
        window.location.href = '../../index.html'
    }

}]);
