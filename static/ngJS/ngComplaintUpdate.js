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
    $scope.toastr_title = 'eVigil BSL!';

    $scope.model = {};
    $scope.mr={};


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

    $scope.comp = {};

    $scope.SelectionChanged = function(frmId, nm){
        $scope.$evalAsync(function(){
            toastr['info']('Selection Changed!', $scope.toastr_title);
            if(nm ==='VO_DTLS'){
                var vls = $scope.comp[nm].split('-');

                $scope.comp['VO_NAME'] = vls[1];
                $('#' + frmId + ' input[name="VO_NAME"]').val(vls[1]).trigger('change');

                $scope.comp['VO_DEGN'] = vls[2];
                $('#' + frmId + ' input[name="VO_DEGN"]').val(vls[2]).trigger('change');
            }
        });
    };

    $scope.SubmitForm = function(frmId){
        $scope.$evalAsync(function(){
            if($scope[frmId].$valid){
                var r = confirm('Are you sure to submit the changes?');
                if(r){
                    console.log(document.getElementById(frmId));
                    document.getElementById(frmId).submit();
                }
            }
            else{
                toastr['info']('Correct Entries and try again!', $scope.toastr_title);
            }
        });
    };


    angular.element(document).ready(function () {
        $scope.base_url = $(location).attr('host');

        $scope.$evalAsync(function () {
            $scope.model = JSON.parse($('p#modelData').text());
            $('p#modelData').text('');
            
            if ($scope.model.hasOwnProperty('comp')){
                $scope.comp = angular.copy($scope.model.comp);
            }

            toastr['info']('Welcome to Complaint Management!', $scope.toastr_title);
        });

        $('.datepicker').daterangepicker({
            singleDatePicker: true,
            timePicker: false,
            timePicker24Hour: false,
            showDropdowns: true,
            drops: "up",
            maxDate: new Date(),
            autoUpdateInput: false,
            autoApply: false,
            locale: {
                format: 'YYYY-MM-DD',
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
                $('#' + frmId + ' input[name="' + nm + '"]').val('').trigger('change');
            });
        });
        
        $('.datepicker').on('apply.daterangepicker', function (ev, picker) {
            var nm = $(this).attr('name');
            var frmId = $(this).closest('form').attr('id');
            $scope.$evalAsync(function () {
                $('#' + frmId + ' input[name="' + nm + '"]').val(picker.startDate.format('YYYY-MM-DD')).trigger('change');
            });
        });

    });

}]);