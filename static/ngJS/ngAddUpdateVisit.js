var app = angular.module('eDeskApp', []);
app.config(function($interpolateProvider) {
    // Change the interpolation delimiters
    $interpolateProvider.startSymbol('[[');  // Opening delimiter
    $interpolateProvider.endSymbol(']]');    // Closing delimiter
  });


  

  app.directive('enterAsTab', function () {
    return {
        restrict: 'A',
        link: function (scope, element) {
            element.on('keydown', function (e) {
                
                if (e.key === 'Enter') {
                    e.preventDefault();

                    // Get all visible, enabled inputs/selects/textarea inside the current form
                    var $form = $(this).closest('form');
                    var $inputs = $form.find('input, select, textarea')
                                    .filter(':visible');
                    var index = $inputs.index(this);

                    if (index > -1 && index < $inputs.length - 1) {
                        $inputs.eq(index + 1).focus();
                    } else {
                        // Optionally loop to first field
                        $inputs.eq(0).focus();
                    }
                }
            });
        }
    };
});

app.controller('eDeskCtrl', ['$scope', '$http', '$filter', '$timeout', function ($scope, $http, $filter, $timeout) {

        //toaster options
    toastr.options = { 'closeButton': 'true', 'debug': false, 'newestOnTop': true, 'progressBar': true, 'positionClass': 'toast-bottom-left', 'preventDuplicates': true, 'onclick': null, 'showDuration': '5000', 'hideDuration': '1200', 'timeOut': '2000', 'extendedTimeOut': '1500', 'showEasing': 'swing', 'hideEasing': 'linear', 'showMethod': 'fadeIn', 'hideMethod': 'fadeOut' };
    $scope.toastr_title = 'SAIL, Bokaro Steel Plant!';

    $scope.model = {};
    $scope.mr={};

    $scope.deptts = [
        "ACVS",
        "AVIATION DELHI OFFICE",
        "AVIATION",
        "BLAST FURNACE",
        "BNPT",
        "BUSINESS EXCELLENCE",
        "C&IT",
        "CCSO",
        "CED SIGS",
        "CED",
        "CO&CC",
        "COLLIERIES",
        "COMPUTERIZATION & AUTOMATION",
        "CONTRACT CELL",
        "CONTRACT CELL-NW",
        "CONTRACTCELL-NW",
        "CRM I&II",
        "CRM-III",
        "CSR",
        "CTS",
        "DIRECTOR INCHARGE BSL SECTT",
        "DISTRIBUTION NETWORK",
        "ECS",
        "ED (WORKS) SECTT",
        "EDUCATION",
        "ELECTRO  TECHNICAL LABORATORY",
        "ELECTRONICS & TELECOM",
        "EMD",
        "F&A",
        "FORGE SHOP",
        "GAS UTILITY",
        "GOM",
        "HR",
        "HRCF",
        "HR-L&D TRAINEE",
        "HR-L&D",
        "HSM",
        "INDUSTRIAL ENGINEERING DEPARTMENT",
        "INGOT MOULD FOUNDRY",
        "INSTRUMENTATION & AUTOMATION",
        "INTELLIGENCE",
        "INTERNAL AUDIT",
        "IRON COPPER & STEEL FOUNDRY AND PATTERN SHOP",
        "KIOM",
        "L&A BSL RANCHI OFFICE",
        "L&A HOSP ADMN",
        "L&A",
        "LAW MINES-COLLIERIES-CCSO",
        "LAW",
        "M & HS",
        "MACHINE & PFRS",
        "MACHINE SHOP",
        "MAINTENANCE",
        "MATERIALS MGMT",
        "MINES",
        "MIOM",
        "MOM",
        "MRD",
        "OG & CBRS",
        "POWER ENGINEERING BRIGADE",
        "POWER FACILITIES",
        "POWER",
        "PPC & SC",
        "PRODUCTION PLANNING SHOPS  INSPECTION & QUALITY CONTROL",
        "PRODUCTION PLANNING SHOPS",
        "PROJECTS CIVIL",
        "PROJECTS COMMERCIAL",
        "PROJECTS EQUIPMENT PLANNING",
        "PROJECTS MILL ZONE",
        "PROJECTS PPM-TIC & IPU",
        "PROJECTS SAFETY",
        "PROJECTS TENDER & CLAIM",
        "PROJECTS",
        "PUBLIC RELATION",
        "RAW MATERIAL",
        "RCL",
        "REFRACTORY",
        "REPAIR RECLAMATION & STRUCTURAL SHOP",
        "RGBS",
        "RM&MHP",
        "RMP",
        "SAFETY & FIRE",
        "SECURITY",
        "SERVICES",
        "SHOPS & FOUNDRY",
        "SINTER PLANT",
        "SMS-I",
        "SMS-II & CCS",
        "SPARE PARTS CELL",
        "SPORTS & CIVIC AMENITIES",
        "STEEL",
        "TECHNICAL CELL",
        "TOWN ADMN",
        "TRAFFIC",
        "TURBO BLOWER STATION",
        "UTILITY",
        "VIGILANCE",
        "WATER MANAGEMENT",
        "WORKS ADMINISTRATION",
        "WORKS"
    ]

    $('form.bv-form').each(function() {
        var frmId = $(this).attr('id');

        // Initialize validator FIRST
        // Then bind revalidate logic
        $('#' + frmId + ' .form-control').on("blur change keyup click", function() {
            var nm = $(this).attr('name');
            if (nm) {
                $('#' + frmId).bootstrapValidator('revalidateField', nm);
            }
        });
    });
    
    $scope.jsonInput = {};

    $scope.visit = {};


    $scope.SubmitForm = function(){
        $scope.$evalAsync(function(){
            if($scope.frmVisit.$valid){
                var r = confirm('Are you sure to submit the changes?');
                if(r){
                    console.log(document.getElementById('frmVisit'));
                    document.getElementById('frmVisit').submit();
                }
            }
            else{
                toastr['error']('Correct Entries and try again!', $scope.toastr_title);
            }
        });
    };


    $scope.members = [];
    $scope.member = {};
    $scope.member.name='';
    $scope.member.org='';
    $scope.member.desg='';
    $scope.member.mob='';
    $scope.member.email='';
    $scope.member.id='';
    $scope.member.gndr='';
    $scope.member.age='';


    angular.element(document).ready(function () {
        $scope.base_url = $(location).attr('host');

        $scope.$evalAsync(function () {
            $scope.model = JSON.parse($('p#modelData').text());
            $('p#modelData').text('');
            
            if ($scope.model.hasOwnProperty('visit')){
                $scope.visit = angular.copy($scope.model.visit);

                var startdt = moment($scope.visit.vststartdt, 'YYYY-MM-DD').format('DD/MM/YYYY');
                var vstenddt = moment($scope.visit.vstenddt, 'YYYY-MM-DD').format('DD/MM/YYYY');

                

                $scope.visit.vststartdt = startdt;
                $scope.visit.vstenddt = vstenddt;

                $('input[name="vststartdt"]').val(startdt).trigger('change');
                $('input[name="vstenddt"]').val(vstenddt).trigger('change');

                for(var fld in $scope.model.user){
                    $scope.visit[fld] = $scope.model.user[fld];
                }
                if($scope.visit.hasOwnProperty('vstmembers')){
                    $scope.members = JSON.parse($scope.visit.vstmembers);
                    $('input#vstmembers').val(JSON.stringify($scope.members));
                }
            }

            toastr['info']('Welcome to Visitor Gate Pass System!', $scope.toastr_title);
        });

        $('.datepicker').daterangepicker({
            singleDatePicker: true,
            timePicker: false,
            timePicker24Hour: false,
            showDropdowns: true,
            drops: "down",
            minDate: new Date(),
            autoUpdateInput: false,
            autoApply: false,
            locale: {
                format: 'DD/MM/YYYY',
                cancelLabel: 'Clear'
            }
        });
        
        $('.datepicker').on('show.daterangepicker', () => {
            $('.daterangepicker').removeClass('auto-apply');
        });

        $('.datepicker').on('cancel.daterangepicker', function (ev, picker) {
            var nm = $(this).attr('name');
            var frmId = $(this).closest('form').attr('id');
            $scope.$evalAsync(function () {
                $scope.visit[nm] = '';
                $('#' + frmId + ' input[name="' + nm + '"]').val('').trigger('change');
                
            });
        });
        
        $('.datepicker').on('apply.daterangepicker', function (ev, picker) {
            var nm = $(this).attr('name');
            var frmId = $(this).closest('form').attr('id');
            $scope.$evalAsync(function () {
                $scope.visit[nm] = picker.startDate.format('DD/MM/YYYY');
                $('#' + frmId + ' input[name="' + nm + '"]').val(picker.startDate.format('DD/MM/YYYY')).trigger('change');
            });
        });

    });


    $scope.DateChanged = function(clm){
        $scope.$evalAsync(function(){
            toastr['info']('Date Changed: !' + clm, $scope.toastr_title);
            switch(clm){
                case "vststartdt":
                    if($('input[name="vstenddt"]').val()===''){
                        $('input[name="vstenddt"]').val($('input[name="vststartdt"]').val()).trigger('change');
                    }
                    $scope.UpdateMinMaxDate(moment($('input[name="vststartdt"]').val(), 'DD/MM/YYYY'), moment($('input[name="vststartdt"]').val(), 'DD/MM/YYYY').add(3, 'days'));
                    break;
                case "vsenddt":
                    break;
                default:
                    break;
            }
            var dt1 = moment($('input[name="vststartdt"]').val(), 'DD/MM/YYYY');
            var dt2 = moment($('input[name="vstenddt"]').val(), 'DD/MM/YYYY');

            var diffDays = dt2.diff(dt1, 'days') + 1;
            $scope.visit.vstdays = diffDays;
            $('input[name="vstdays"]').val(diffDays);
        });
    };

    $scope.AddMember = function(){
        $scope.$evalAsync(function(){
            $scope.member = {};
            $scope.current_index = -1;
            $('div#mdlAddUpdateMember').modal('show');
        });
    };

    $scope.UpdateMember = function(index){
        $scope.$evalAsync(function(){
            $scope.member = $scope.members[index];
            $scope.current_index = index;
            $('div#mdlAddUpdateMember').modal('show');
        });
    };

    $scope.current_index = -1;

    $scope.DeleteMember = function(index){
        $scope.$evalAsync(function(){
             var r = confirm('Are you sure to remove member '+ (index+1) +'?');
            if(r){
                $scope.current_index = index;
                $scope.members.splice(index, 1);
                $scope.visit.vstmembers = JSON.stringify($scope.members);
                $('input#vstmembers').val(JSON.stringify($scope.members));
            }
        });
    };

    $scope.UpdateMembers = function(){
        $scope.$evalAsync(function(){

            if($scope.frmMember.$valid){
                var r = confirm('Are you sure to add member?');
                if(r){
                    if($scope.current_index<0){
                        $scope.members.push($scope.member);
                    }
                    $('input#vstmembers').val(JSON.stringify($scope.members));
                    $('div#mdlAddUpdateMember').modal('hide');
                }
            }
            else{
                toastr['error']('Correct Entries and try again!', $scope.toastr_title);
            }
        })
    };

    $scope.UpdateMinMaxDate = function(minDT, maxDT) {
        $scope.$evalAsync(function(){
            const picker = $('.datepicker').data('daterangepicker');
            
            picker.minDate = minDT;
            picker.maxDate = maxDT;

            picker.setStartDate(minDT);
            picker.setEndDate(maxDT);

            // Optional: Re-render the calendar UI
            picker.updateView();
            picker.updateCalendars();
        });
    };


}]);