
BEGIN {
FS = ";"
print "@relation \'druggene\'";
print "@attribute GENE string";
print "@attribute TYPE string";
print "@attribute GENE string";
print "@attribute DISEASE string";
print "@attribute DRUG string";
print "@attribute CLASS {0,1,2}";
print "@data";
}

{

print $1",'"$2"',"$3","$4","$5;
}
