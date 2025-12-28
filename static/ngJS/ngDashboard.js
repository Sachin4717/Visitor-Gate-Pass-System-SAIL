var app = angular.module('eDeskApp', []);
app.config(function($interpolateProvider) {
    // Change the interpolation delimiters
    $interpolateProvider.startSymbol('[[');  // Opening delimiter
    $interpolateProvider.endSymbol(']]');    // Closing delimiter
  });
app.controller('eDeskCtrl', ['$scope', '$http', '$filter', '$timeout', function ($scope, $http, $filter, $timeout) {

        //toaster options
    toastr.options = { 'closeButton': 'true', 'debug': false, 'newestOnTop': true, 'progressBar': true, 'positionClass': 'toast-bottom-left', 'preventDuplicates': true, 'onclick': null, 'showDuration': '5000', 'hideDuration': '1200', 'timeOut': '2000', 'extendedTimeOut': '1500', 'showEasing': 'swing', 'hideEasing': 'linear', 'showMethod': 'fadeIn', 'hideMethod': 'fadeOut' };
    $scope.toastr_title = 'eDesk-BSL!';

    $scope.model = {};
    $scope.mr={};

    $scope.consent =  {
        uan:'',
        choice: 0,
        sts: null,
        wefdt: null,
    }

    $('form.bv-form').each(function () {
        var frmId = $(this).attr('id');
        $('#' + frmId + ' .form-control').on("blur, change, keyup, click", function () {
            var nm = $(this).attr('name');
            $('#' + frmId + '').bootstrapValidator('revalidateField', nm);
        });
    });
    
    $scope.jsonInput = {};
    
    $scope.ValidateFormById = function (frmId) {
        $scope.$evalAsync(function () {
            $('#' + frmId + ' .form-control').each(function () {
                var nm = $(this).attr('name');
                $('#' + frmId + '').bootstrapValidator('revalidateField', nm);
            });
        });
    };

    $scope.icons = {};
    $scope.icons["pie"] = "bx-pie-chart-alt-2";
    $scope.icons["column"] = "bx-bar-chart";
    $scope.icons["area"] = "bx-chart";
    $scope.icons["line"] = "bx-line-chart";
    $scope.icons["bar"] = "bx-bar-chart";
    $scope.icons["bubble"] = "bx-bar-chart";
    $scope.icons["table"] = "bx-grid";

    $scope.dtClmns = {
        "SNO":{"df":""}
        ,"CN":{"df":""}
        ,"CB":{"df":""}
        ,"CDT":{"df":"dt"}
        ,"CSRC":{"df":""}
        ,"VON":{"df":""}
        ,"VOD":{"df":""}
        ,"STG":{"df":""}
        ,"CBY":{"df":""}
        ,"CON":{"df":"dtt"}
        ,"LUBY":{"df":""}
        ,"LUON":{"df":"dtt"}
    }

    $scope.colors = [
        '#90ed7d',
        '#70A5FF',
        '#f7a35c',
        '#4B49AC'
    ];

    $scope.selist = [];
    $scope.se = {}

    angular.element(document).ready(function () {
        $scope.base_url = $(location).attr('host');

        $scope.$evalAsync(function () {
            $scope.model = JSON.parse($('p#modelData').text());
            $('p#modelData').text('');
            
            if($scope.model.stngs.hasOwnProperty('SELIST')){
                $scope.selist = JSON.parse($scope.model.stngs['SELIST']);
            }
            $scope.CreateDimention();
            toastr['info']('Welcome to eDesk!', $scope.toastr_title);
        });
    });

    $scope.AssignServiceEngineer = function() {
        $http.post('/api/assign-se/', $scope.se)
          .then(function(response) {
            $scope.response = response.data;
          }, function(error) {
            $scope.response = { status: 'error', message: 'Submission failed' };
          });
      };


    $scope.rData = null;
    $scope.rfdArray = [];

    $scope.sFilters = {};
    $scope.iChartDimensions = {};

    //["pie", "column", "table"]

    $scope.iChartDimensions["STG"] = {};
    $scope.iChartDimensions["STG"].cList = ["pie", "column", "table"];
    $scope.iChartDimensions["STG"].default = 'column';
    $scope.iChartDimensions["STG"].fname = 'Type';
    $scope.iChartDimensions["STG"].clm = 'STG';
    $scope.iChartDimensions["STG"].show = true;
    $scope.iChartDimensions["STG"].title = 'Complaint Stage Wise';
    $scope.iChartDimensions["STG"].colsize = 'col-lg-4 col-md-4 col-sm-6 col-12';

    $scope.iChartDimensions["CSRC"] = {};
    $scope.iChartDimensions["CSRC"].cList = ["pie", "column", "table"];
    $scope.iChartDimensions["CSRC"].default = 'column';
    $scope.iChartDimensions["CSRC"].fname = 'Type';
    $scope.iChartDimensions["CSRC"].clm = 'CSRC';
    $scope.iChartDimensions["CSRC"].show = true;
    $scope.iChartDimensions["CSRC"].title = 'Complaint Source Wise';
    $scope.iChartDimensions["CSRC"].colsize = 'col-lg-4 col-md-4 col-sm-6 col-12';

    $scope.iChartDimensions["VON"] = {};
    $scope.iChartDimensions["VON"].cList = ["pie", "column", "table"];
    $scope.iChartDimensions["VON"].default = 'column';
    $scope.iChartDimensions["VON"].fname = 'Type';
    $scope.iChartDimensions["VON"].clm = 'VON';
    $scope.iChartDimensions["VON"].show = true;
    $scope.iChartDimensions["VON"].title = 'Vigilance Officers Wise';
    $scope.iChartDimensions["VON"].colsize = 'col-lg-4 col-md-4 col-sm-6 col-12';

    

    $scope.ShowDetails = function () {
        $scope.$evalAsync(function () {
            $scope.PopulateDataArrays();
        });
    };

    

    $scope.PageLoading = true;
    $scope.rcData = {};

    $scope.ResetFilters = function () {
        $scope.$evalAsync(function () {
            $scope.sFilters = {};
            for (var dim in $scope.infcl) {
                $scope.infcl[dim].slist = {};
                $scope.infcl[dim].list = {};
            }
            $scope.CreateDimention(false);
        });
    };

    $scope.infcl = {};
    for (var dim in $scope.iChartDimensions) {
        $scope.infcl[dim] = {};
        $scope.infcl[dim].default = $scope.iChartDimensions[dim].default;
        $scope.infcl[dim].title = $scope.iChartDimensions[dim].title;
        $scope.infcl[dim].fname = $scope.iChartDimensions[dim].fname;
        $scope.infcl[dim].clm = $scope.iChartDimensions[dim].clm;
        $scope.infcl[dim].colsize = $scope.iChartDimensions[dim].colsize;
        $scope.infcl[dim].cList = {};

        for (var j in $scope.iChartDimensions[dim].cList) {
            var chart = $scope.iChartDimensions[dim].cList[j];
            $scope.infcl[dim].cList[chart] = {};
            $scope.infcl[dim].cList[chart].container = 'rc_' + dim + '_' + chart;
            $scope.infcl[dim].cList[chart].icon = $scope.icons[chart];
        }
        $scope.infcl[dim].list = [];
        $scope.infcl[dim].slist = {};
    }

    $scope.CreateDimention = function (StageParam) {
        $scope.$evalAsync(function () {

            for(j in $scope.model.complaints){
                if($scope.model.complaints[j].sename===''){
                    $scope.model.complaints[j].sename = '-';
                }
                if($scope.model.complaints[j].compsts===''){
                    $scope.model.complaints[j].compsts = '-';
                }
            }
            $scope.rData = crossfilter($scope.model.complaints);
            for (var dim in $scope.infcl) {
                $scope.infcl[dim].dim = $scope.rData.dimension(function (d) { return d[dim]; });
            }
            $scope.PopulateDataArrays();

        });
    };




    $scope.ApplyFilters = function (dim, key) {

        $scope.$evalAsync(function () {
            $scope.PageLoading = true;
            toastr['info']('Applying Filters for: ' + key, $scope.toastr_title);
            if ($scope.infcl[dim].slist.hasOwnProperty(key)) {
                delete $scope.infcl[dim].slist[key];
                delete $scope.sFilters[dim].slist[key];
            }
            else {
                $scope.infcl[dim].slist[key] = 1;
                if ($scope.sFilters.hasOwnProperty(dim)) {
                    if ($scope.sFilters[dim].hasOwnProperty(key)) {
                        $scope.sFilters[dim].slist[key] = 1;
                    }
                    else {
                        $scope.sFilters[dim].slist = {};
                        $scope.sFilters[dim].slist[key] = 1;
                    }
                }
                else {
                    $scope.sFilters[dim] = {};
                    $scope.sFilters[dim].slist = {};
                    $scope.sFilters[dim].slist[key] = 1;
                }
            }
            $scope.PopulateDataArrays();
        });

    };


    $scope.GraphsParamChanged = function (param) {
        $scope.$evalAsync(function () {
            $scope.PopulateDataArrays();
        });
    };

    $scope.N = 0;
    $scope.A = 0;

    $scope.PopulateDataArrays = function () {

        $scope.$evalAsync(function () {

            //Generating Data Array for all dimensions
            $scope.rcData = {};
            var lastDim = '';
            for (var dim in $scope.infcl)
            {
                $scope.infcl[dim].dim.filterAll();
                lastDim=dim;
            }
            for (var dim in $scope.infcl)
            {
                if (Object.keys($scope.infcl[dim].slist).length > 0) {
                    $scope.infcl[dim].dim.filter(function (d) { if (d in $scope.infcl[dim].slist) return d; });
                }
            }
            for (var dim in $scope.infcl)
            {
                $scope.infcl[dim].list = $scope.infcl[dim].dim.group().reduce($scope.cdrAdd, $scope.cdrRemove, $scope.cdrInit)
                .top(Infinity).filter(function (p) { return p.value.C > 0; });
                $scope.infcl[dim].list = $scope.infcl[dim].list.sort(function (a, b) { return a.key > b.key ? 1 : -1; });
            }

            $scope.N = $scope.infcl[lastDim].dim.groupAll().reduceCount(function (d) {
                return d.C;
            }).value();

            $scope.rfdArray = $scope.infcl[lastDim].dim.top(Infinity);
            $scope.$evalAsync(function () {
                for (var dim in $scope.infcl) {
                    var cType = $scope.infcl[dim].default;
                    $scope.ChangeGraphType(cType, dim, '', 0);
                }
            });
            $scope.RenderFilteredDataTable();
            toastr['info']('Filters Applied', $scope.toastr_title);
        });
    };

    $scope.ChangeGraphType = function (cType, dim, subtitle, marginleft) {
        $scope.$evalAsync(function () {
            var container = $scope.infcl[dim].cList[cType].container;
            
            $scope.infcl[dim].default = cType;
            var source = [];

            source = $scope.infcl[dim].list;

            var title = $scope.infcl[dim].title + ' (' + source.length + ')';
            switch (cType) {
                case "pie":
                    $scope.GeneratePieChartData(source, container, title);
                    $scope.DrawPieChart(dim, container, title, '');
                    break;
                case "column":
                case "area":
                case "line":
                    $scope.GenerateMixChartData(source, container, title, cType, dim);
                    $scope.DrawMixChart(dim, container, title, '', cType);
                    break;
                case "table":
                    $scope.RenderDataTable(dim, source);
                    break;
                default:
                    break;
            }
            //
            //Nav tabs Activate
            //
            $('ul.chart-types a.class').removeClass('active');
        });
    };

    $('body').on('click', 'span.cb-filter', function () {
        var kv = $(this).attr('key');
        var kv_parts = kv.split("$#$");
        $scope.ApplyFilters(kv_parts[0], kv_parts[1]);
    });


    
    $scope.ChangeGraphParameters = function (gpt) {
        $scope.$evalAsync(function () {
            $scope.GPT = gpt;
            $scope.PopulateDataArrays();
        });
    };

    $scope.dimTable = {};
    $scope.RenderDataTable = function (dim, source) {
        $scope.$evalAsync(function () {
            
            if (!$scope.dimTable.hasOwnProperty(dim)) {

                $scope.dimTable[dim] = $("table#dt_" + dim + '_table').DataTable({
                    language: { search: '', searchPlaceholder: "Search" },
                    dom: 'lBfrtip',
                    // Configure the drop down options.
                    lengthMenu: [
                        [10],
                        ['10 rows']
                    ],
                    "destroy": true,
                    data: source,
                    buttons: [
                        {
                            extend: 'excelHtml5',
                            text: '<i class="bx bx-spreadsheet text-success"></i>',
                            titleAttr: 'Expotype to Excel'
                        }
                    ],
                    columns: [
                        {
                            "data": "key",
                            "orderable": false,
                            "render": function (data, type, row) {
                                var cb = '';
                                if (data in $scope.infcl[dim].slist) {
                                    cb = '<span key="' + dim + '$#$' + data + '" class="bx bx-checkbox-checked cb-filter"></b></span>';
                                }
                                else {
                                    cb = '<span key="' + dim + '$#$' + data + '" class="bx bx-checkbox cb-filter"></b></span>';
                                }
                                return cb;
                            }
                        },
                        { "data": "key" },
                        {
                            "data": "value",
                            "orderable": true,
                            "render": function (data, type, row) {
                                return data.C;
                            }
                        }
                    ]
                });
            }
            else {
                $("table#dt_" + dim + '_table').DataTable().clear();
                $("table#dt_" + dim + '_table').DataTable().rows.add(source); // Add new data
                $("table#dt_" + dim + '_table').DataTable().draw(); // Redraw the DataTable
            }
        });
    };

    $scope.GenerateMixChartData = function (source, container, seriesName, cType, dim) {
        
        $scope.rcData[container] = {};
        $scope.rcData[container].catData = [];
        $scope.rcData[container].seriesData = [];

        var bSeries = {};
        bSeries.data = [];
        bSeries.name = 'Nos';
        bSeries.type = 'column';
        bSeries.step = 'center';


        for (j in source) {
            $scope.rcData[container].catData.push(source[j].key);
            if(dim==='jobsts')
            {
                bSeries.data.push({ y: source[j].value.C, N: source[j].value.C, color: $scope.colors[j/$scope.colors.length]});
            }
            else{
                bSeries.data.push({ y: source[j].value.C, N: source[j].value.C });
            }
            
        }

        $scope.rcData[container].seriesData.push(bSeries);
    };

    $scope.GenerateColumnChartData = function (source, container, seriesName, cType, dim) {
        $scope.rcData[container] = {};
        $scope.rcData[container].catData = [];
        $scope.rcData[container].seriesData = [];

        var aSeries = {};
        aSeries.data = [];


        for (j in source) {
            $scope.rcData[container].catData.push(source[j].key);
            switch (cType) {
                case "column":
                case "bar":
                case "area":
                case "line":
                    aSeries.name = '';
                    aSeries.data.push({ y: source[j].value.A / source[j].value.C, N: source[j].value.C });
                    break;
                default:
                    break;
            }
        }

        switch (cType) {
            case "column":
            case "bar":
            case "area":
            case "line":
                $scope.rcData[container].seriesData.push(aSeries);
                break;
            default:
                break;
        }

    };

    

    $scope.DrawMixChart = function (dim, container, title, subtitle, cType) {

        $scope.$evalAsync(function () {
            $('#' + container).highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    height: 320
                },
                title: {
                    align: 'left',
                    text: '<b>' + title + '</b>'
                },
                xAxis: {
                    categories: $scope.rcData[container].catData,
                    crosshair: true,
                    labels: {
                        events: {
                            click: function (e) {
                                alert(this.value);
                            }
                        },
                    },
                },
                yAxis: {
                    title: {
                        text: 'Nos'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat:
                        '<tr>' +
                        '<td style="color:{series.color};padding:0">{series.name} </td>' +
                        '<td style="color:{series.color};padding:0">{point.N}</td>' +
                        '</tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                colors: $scope.colors,
                plotOptions: {
                    column: {
                        colors: $scope.colors,
                        stacking: 'normal',
                        pointPadding: 0.1,
                        borderWidth: 0,
                        colorByPoint: true,
                        dataLabels: {
                            enabled: true,
                            crop: false,
                            inside: false,
                            overflow: 'none',
                            formatter: function () {
                                return Highcharts.numberFormat(this.y, 0);
                            }
                        }
                    },
                    spline: {
                        stacking: 'normal',
                        pointPadding: 0.1,
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            crop: false,
                            inside: false,
                            overflow: 'none',
                            formatter: function () {
                                return Highcharts.numberFormat(this.y, 0);
                            }
                        }
                    },
                    series: {
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            crop: false,
                            overflow: 'none',
                            inside: false,
                            formatter: function () {
                                return Highcharts.numberFormat(this.y, 1);
                            }
                        },
                        point: {
                            events: {
                                click: function () {
                                    //aletype('Category: ' + this.category + ', value: ' + this.y);
                                    $scope.ApplyFilters(dim, this.category);
                                }
                            }
                        }
                    }
                },
                credits: {
                    enabled: false
                },
                series: $scope.rcData[container].seriesData
            });
        });
    };

    

    $scope.GeneratePieChartData = function (source, container, title) {
        $scope.rcData[container] = [];
        var series = {};
        series.name = title;
        series.type = 'pie';
        series.colorByPoint = true;
        series.data = [];
        for (j in source) {
            tmpSeries = {};
            tmpSeries.name = source[j].key;
            tmpSeries.y = parseFloat(((source[j].value.C * 100) / $scope.N).toFixed(2));
            tmpSeries.A = parseFloat(source[j].value.A) / 10000000;
            tmpSeries.N = parseFloat(source[j].value.C);
            series.data.push(tmpSeries);
        }
        $scope.rcData[container].push(series);
    };

    $scope.DrawPieChart = function (dim, container, title, subtitle) {

        $('#' + container).highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                height: 320
            },
            title: {
                align: 'left',
                text: '<b>' + title + '</b>'
            },
           
            tooltip: {
                headerFormat: '<div style="background-color:#fff;color:#000;padding:2px;opacity:0.4;"><span style="font-size:10px"><b>{point.key}</b></span><table>',
                pointFormat:
                    '<tr><td style="color:{series.color};padding:0"><b>No:</b> </td>' +
                    '<td style="padding:0">{point.N}</td></tr>'
                ,
                footerFormat: '</table></div>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.3f}% [{point.N}]',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                },
                series: {
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    point: {
                        events: {
                            click: function () {
                                //aletype('Category: ' + this.name + ', value: ' + this.y);
                                $scope.ApplyFilters(dim, this.name);
                            }
                        }
                    }
                }
            },

            credits: {
                enabled: false
            },
            series: $scope.rcData[container]
        });
    };

    $('body').on('click', 'span.action-btns', function () {
        var id = $(this).attr('id');
        
        $scope.$evalAsync(function(){
            var id_parts = id.split('_');
            switch(id_parts[0])
            {
                case "edt":
                    var index = _.findIndex($scope.model.complaints, { id: id_parts[1] });
                    if (index >= 0) {
                        $scope.comp = $scope.model.complaints[index];
                        toastr['success']('You are updating Complaint No ' + $scope.comp.compno + '!', $scope.toastr_title);
                        $('div#mdlUpdateComplaint').modal('show');
                    }
                default:
                    break;
            }
            
        });
    });

    $scope.cfdTable = null;

    $scope.RenderFilteredDataTable = function () {
        $scope.$evalAsync(function () {
            
            if ($scope.cfdTable === null) {

                clmns = [];
                // clmns.push(
                //     {
                //         "data": "id",
                //         "orderable": true,
                //         "render": function (data, rt, row) {
                //             return '<a href="/plantdesign/job_update?jobid='+ data +'" class="btn btn-link"><b class="bx bx-edit"></b></a>';
                //         }
                //     }
                // );
                
                for(var clm in $scope.dtClmns) {
                    switch($scope.dtClmns[clm].df) {
                        case "dtt":
                            clmns.push(
                                {
                                    "data": clm,
                                    "orderable": true,
                                    "render": function (data, rt, row) {
                                        return $filter('date')(data, 'yyyy-MM-dd HH:mm:ss');
                                    }
                                }
                            );
                            break;
                        case "dt":
                            clmns.push(
                                {
                                    "data": clm,
                                    "orderable": true,
                                    "render": function (data, rt, row) {
                                        return $filter('date')(data, 'yyyy-MM-dd');
                                    }
                                }
                            );
                            break;
                        default:
                            if (clm==='SNO'){
                                clmns.push(
                                    {
                                        "data": "SNO",
                                        "orderable": true,
                                        "render": function (data, rt, row) {
                                            return '<a href="/home/update-complaint/'+ row.ID +'" class="btn btn-sm btn-primary"><b class="bx bxs-edit"></b>'+ row.FY + '-' +  data +'</a>';
                                        }
                                    }
                                );
                            }
                            else{
                                clmns.push(
                                    {
                                        "data": clm,
                                        "orderable": true,
                                        "render": function (data, rt, row) {
                                            return data;
                                        }
                                    }
                                );
                            }
                            
                            break;
                    }
                }

                $scope.cfdTable = $('table#fdArray').dataTable({
                    language: { search: '', searchPlaceholder: "Search" },
                    dom: 'lBfrtip',
                    // Configure the drop down options.
                    lengthMenu: [
                        [10, 25, 50, -1],
                        ['10 rows', '25 rows', '50 rows', 'Show all']
                    ],
                    "bDestroy": true,
                    data: $scope.rfdArray,
                    buttons: [
                        {
                            extend: 'excelHtml5',
                            text: '<i class="bx bx-spreadsheet text-success"></i>',
                            titleAttr: 'Export to Excel'
                        }
                    ],
                    
                    columns: clmns
                });
            }
            else {
                $('table#fdArray').DataTable().clear();
                $('table#fdArray').DataTable().rows.add($scope.rfdArray); // Add new data
                $('table#fdArray').DataTable().draw(); // Redraw the DataTable
            }
        });
    };

    
    $scope.cdrInit = function () {
        return {
            C: 0,
        };
    };
    $scope.cdrAdd = function (p, v) {
        p.C += 1;
        return p;
    };
    $scope.cdrRemove = function (p, v) {
        p.C -= 1;
        return p;
    };

    //
    //Higher Pension Status
    //


}]);