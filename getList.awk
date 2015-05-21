BEGIN {FS = ";"}
{
if($1!="" && $4!="") {

print $0";",system("node ./parsePharmgkb.js isAssociated " $1 " " $4);


}
}
